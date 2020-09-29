Chart.defaults.global.animation.onComplete = (e) => onCompleteCallback(e.chart);

function onCompleteCallback(id) {
  let div = document.getElementById("pngPlaceHolder");
  let img = document.createElement("IMG");
  //console.log(id.canvas.id);
  img.className = "fp-image";
  img.id = id.canvas.id + "-png";
  img.src = id.toBase64Image();
  div.appendChild(img);
}
