/* globals selections */
const title = document.querySelector('#title')
const qbody = document.querySelector('#body')

const titleRed = document.querySelector('#titleRedact')
const qbodyRed = document.querySelector('#bodyRedact')

const counter = document.querySelector('#count')

let currentSample;

function pick() {
  selections = []
  fetch('/sample').then(r => r.json()).then(data => {
    currentSample = data.sample
    title.innerText = data.sample.title
    qbody.innerText = data.sample.body
    titleRed.innerText = data.sample.title
    qbodyRed.innerText = data.sample.body
    counter.innerText = data.count
  })
}

function getSelectionOffsets(pElement) {
  const range = window.getSelection().getRangeAt(0);
  const text = pElement.innerText;
  const selectedText = range.toString();

  const startOffset = text.indexOf(selectedText);
  const endOffset = startOffset + selectedText.length;

  return { start: startOffset, stop: endOffset };
}


function checkSelection() {
  let sel = document.getSelection()
  if (sel.type != "Range") return
  if (sel.toString().length == 0) return
  if ((sel.anchorNode != sel.extentNode) || (sel.extentNode != sel.focusNode)) return
  let spans = getSelectionOffsets(qbody)
  spans.elem = "body"
  if (spans.start < 0) {
    spans = getSelectionOffsets(title)
    spans.elem = "title"
  }
  console.log(spans)
  return spans
}

function wrapSpans(str, spans) {
  let result = '';
  let lastIndex = 0;
  spans.forEach(span => {
    result += str.slice(lastIndex, span.start);
    let frag = `<span class="bg-info">${str.slice(span.start, span.stop)}</span>`
    result += frag;
    lastIndex = span.stop + frag.length;
  });
  result += str.slice(lastIndex);
  return result;
}

function renderSpans() {
  let bodySpans = selections.filter(s => s.elem == "body")
  let titleSpans = selections.filter(s => s.elem == "title")
  let bodyText = qbody.innerHTML
  let titleText = title.innerHTML
  qbodyRed.innerHTML = wrapSpans(bodyText, bodySpans)
  titleRed.innerHTML = wrapSpans(titleText, titleSpans)
}

function undo(event) {
  title.innerText = currentSample.title
  qbody.innerText = currentSample.body
  titleRed.innerText = currentSample.title
  qbodyRed.innerText = currentSample.body
}

async function update(event) {
  const resp = await fetch(`/redact/${currentSample.id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(selections)
  })
  pick()
}
