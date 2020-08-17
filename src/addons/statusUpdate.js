module.exports = function statusUpdate(prop) {
  let returnId;
  let values = Object.assign({}, {
    text:"", status: "", id: "", format: false, progress: null
  }, prop);
  let elem = document.querySelector('[class="status"]');
  let div;
  if (typeof values.id === "string" && elem.querySelector(`[id="${values.id}"]`)) {
    div = elem.querySelector(`[id="${values.id}"]`);
    if (values.progress === 0 || values.progress && typeof values.progress === "number" ) {
      div.querySelector('progress').value = values.progress;
      div.querySelector('progress').max = 100;
    }
    else if (values.progress === "break") {
      div.querySelector('progress').removeAttribute("value");
      div.querySelector('progress').max = 100;
    }
    returnId = values.id;
  }
  else {
    div = document.createElement("div");
    div.appendChild(document.createElement("div"));
    if (values.progress === 0 || values.progress && typeof values.progress === "number" ) {
      let progress = document.createElement("progress");
      progress.value = values.progress;
      progress.max = 100;
      div.appendChild(progress);
    }
    else if (values.progress === "break") {
      let progress = document.createElement("progress");
      progress.removeAttribute("value");
      progress.max = 100;
      div.appendChild(progress);
    }
    returnId = div.id = randomId();
  }
  if (typeof values.status === "boolean") {
    div.classList.add(values.status ? "success": "failed");
    div.classList.remove(!values.status ? "success": "failed");
  }
  else { values.status && div.classList.add(values.status); }
  values.text && (() => {
    let temp = [];
    values.text.split(" ").forEach((item, i) => {
      let span = document.createElement("span");
      span.textContent = item;
      span.innerHTML += "&nbsp;";
      temp.push(span);
    });
    
    div.querySelector('div').innerHTML = "";
    if (typeof values.format === "boolean" && values.format ) {
      div.querySelector('div').innerHTML = values.text
    }
    else {
      for (let items of temp) {
        div.querySelector('div').appendChild(items);
      }
    }
    elem.insertBefore(div, elem.firstChild);
  })();
  return returnId;
}