var entryNode;
var peers = [];

function encode(str) {
  var enc = window.btoa(str);
  console.log(enc);
  return enc;
}

function decode(str) {
  var enc = window.atob(str);
  console.log(enc);
  return enc;
}

function updateLocalStorage(what) {
  if (what == "entry") {
    localStorage.setItem("entryNode", JSON.stringify(entryNode));
  }
  if (what == "peer") {
    localStorage.setItem("peers", JSON.stringify(peers));
    displayPeerList();
  }
}

function pushEntryNode(link) {
  console.log("Updated Entry Node");
  updateLocalStorage("entry");
}

function pushPeerList(link) {
  peers.push(link);
  updateLocalStorage("peer");
}

function removePeerList(num) {
  peers.splice(num, 1);
  updateLocalStorage("peer");
}

function clickDelete(element) {
  var delThis = $(element).parent().attr('id');
  removePeerList(delThis);
}

function displayPeerList() {
  peerCheck();
  $("#peers").html("");
  for (var i = 0; i < peers.length; i++) {
    $("#peers").append(
      $('<li>').attr('id', i).append('<b>Peer# ' + (i + 1) + '</b> @ ' + peers[i] + '<img onclick="clickDelete(this)" class="small-img" src="https://cdnjs.cloudflare.com/ajax/libs/foundicons/3.0.0/svgs/fi-x.svg"/>'));
  }
}

function peerCheck() {
  if (peers.length < 1) {
    $("#content-header").html("<h1>No Peers</h1>");
  } else {
    $("#content-header").html("");
  }
}


function removeRandomLetter(str) {
  var pos = Math.floor(Math.random() * (str.length));
  return str.substring(pos, pos + 1);
}

function encodeLink(link) {

  var random = Math.floor(Math.random() * 1001);
  var newlink = "";

  for (var i = 0; i < 10; i++) {
    newlink += removeRandomLetter(link);
  }

  console.log(newlink);

  var encoded = encode(newlink);

  console.log(encoded);

  var res = encoded.substr(0, 10);
  console.log(res);

  putLink(res, link);

}

async function putLink(shortcode, link) {

  var thisobj = {
    [shortcode]: link
  };
  console.log(thisobj);

  await gun.get(shortcode).put(thisobj, function(ack) {
    if (ack.err) {
      console.log("error");
      return;
    }
  });
}

function getLink(shortcode) {
  var code = shortcode.toString();
  setTimeout(function() {
    gun.get(shortcode).get(code).once(function(ack) {
      console.log(ack);
      location.assign(ack);
    });
  }, 200);
}

$(document).ready(async function() {

  peerCheck();

  if (localStorage.getItem("entryNode") === null) {
    console.log("no entry node");
  } else {
    var data = localStorage.getItem("entryNode");
    entryNode = JSON.parse(data);
  }

  if (localStorage.getItem("peers") === null) {
    console.log("no peers");
    $("#main-content").html("<h1>No Peers</h1>");
  } else {
    var data = localStorage.getItem("peers");
    peers = JSON.parse(data);
    displayPeerList();
  }

  //Peer Manipulation Code

  $("a.setEntryNode").on("click", function(event) {
    entryNode = window.prompt("Set Your Entry Node", "http://");
    pushEntryNode(entryNode);

  });

  $("a.viewPeers").on("click", async function() {
    await getInitialPeers().then(function() {
      console.log("Connected Peer Nodes: ", peers);
    }).catch(alert("No Entry Node Set / Peers Found"));
  });

  $("a.addPeers").on("click", function(event) {
    var addPeer = window.prompt("Add A New Peer Node", "http://");
    pushPeerList(addPeer);
    console.log("New Peer Node Added: ", peers);
  });

  //Short Links Code

  $("a.addNewLink").on("click", function(event) {
    var addNewLink = window.prompt("Add A New Encoded Link", "http://");
    encodeLink(addNewLink);
  });

  $("a.addCustomLink").on("click", function(event) {
    var addNewLink = window.prompt("Add A New Custom Link", "http://");
    var addNewLinkName = window.prompt("Link Name (Less than 10 chars)", "example123");
    console.log(addNewLink);
    console.log(addNewLinkName);
    if(addNewLinkName.length>10){
      alert("Link name greater than 10 chars");
    }else{
      if(!/[^a-zA-Z0-9]/.test(addNewLinkName)) {
        console.log("link name accepted");
        putLink(addNewLinkName, addNewLink)
      }else{
        console.log("link name not accepted");
      }
    }
  });


});
