const amiiboApiUrl = "https://amiiboapi.com/api/amiibo/";

function parseRowDataAndInsertRow(rowJSON, tableBody){
  rowHtmlData  = "<tr>";
  rowHtmlData += "<td>" + rowJSON.head + rowJSON.tail + "</td>";
  rowHtmlData += "<td>" + rowJSON.name + "</td>";
  rowHtmlData += "<td>" + rowJSON.character + "</td>";
  rowHtmlData += "<td>" + rowJSON.amiiboSeries + "</td>";
  rowHtmlData += "<td>" + rowJSON.gameSeries + "</td>";
  rowHtmlData += "<td>" + rowJSON.type + "</td>";
  rowHtmlData += "<td><button class=\"img-load-btn\" data-url=\"" + rowJSON.image + "\">Load Image</button></td>";
  rowHtmlData += "<td><button class=\"download-btn\">Download</button></td>";
  rowHtmlData += "</tr>";
  tableBody.innerHTML += rowHtmlData;
  tableBody.lastChild.lastChild.lastChild.setAttribute("data-raw", JSON.stringify(rowJSON));
}

function loadImage(buttonElement) {
  buttonElement.parentNode.innerHTML = "<img src=\"" + buttonElement.getAttribute("data-url") + "\"></img>";
}

/* UUID v4 generator via https://stackoverflow.com/a/2117523 START */
function uuidv4() {
  if (typeof(crypto) == "undefined") {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16).toUpperCase();
    });
  } else {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16).toUpperCase()
    );
  }
}
/* UUID v4 generator via https://stackoverflow.com/a/2117523 END */

function downloadAmiibo(buttonElement) {
  var rawData = JSON.parse(buttonElement.getAttribute("data-raw"));
  var date = new Date().toJSON().slice(0,10);

  var common = JSON.stringify({
    "writeCounter":0,
    "version":0,
    "lastWriteDate": date
  });
  var model = JSON.stringify({
    "amiiboId": rawData.head + rawData.tail
  });
  var register = JSON.stringify({
    "name": rawData.name,
    "firstWriteDate": date,
    "miiCharInfo":"mii-charinfo.bin"
  });
  var tag = JSON.stringify({
    "randomUuid": true,
    "uuid": uuidv4()
  });

  var zip = new JSZip();
  var folder = zip.folder(rawData.name);
  folder.file("common.json", common);
  folder.file("model.json", model);
  folder.file("register.json", register);
  folder.file("tag.json", tag);
  zip.generateAsync({type:"blob"}).
    then(function(content) {
      saveAs(content, rawData.name + ".zip");
    });
}

window.onload = (event) => {
  fetch(amiiboApiUrl).
    then(response => response.json()).
    then(function(json_data){
      document.getElementById("loader").style.display = "none";
      document.getElementById("tableDiv").style.display = "block";

      var tableBody = document.getElementById("table-body");
      json_data.amiibo.forEach(function(rowJSON){
        parseRowDataAndInsertRow(rowJSON, tableBody);
      });

      var imageLoadButtons = document.getElementsByClassName("img-load-btn");
      Array.from(imageLoadButtons).forEach(function(buttonElement) {
        buttonElement.addEventListener("click", function(){
          loadImage(this);
        });
      });

      var downloadButtons = document.getElementsByClassName("download-btn");
      Array.from(downloadButtons).forEach(function(buttonElement) {
        buttonElement.addEventListener("click", function(){
          downloadAmiibo(this);
        });
      });
    });
};
