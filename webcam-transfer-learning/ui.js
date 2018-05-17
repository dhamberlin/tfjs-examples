/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */
import * as tf from '@tensorflow/tfjs';

const PASS_STATUS = ['yes1', 'ok', 'fail', 'yes2'];
const CONTROLS = ['up', 'down', 'left', 'right'];
const CONTROL_CODES = [38, 40, 37, 39];

export function init() {
  document.getElementById('controller').style.display = '';
  statusElement.style.display = 'none';
}

const trainStatusElement = document.getElementById('train-status');

const loggedInElement = document.getElementById('logged-in');

// Set hyper params from UI values.
const learningRateElement = document.getElementById('learningRate');
export const getLearningRate = () => +learningRateElement.value;

const batchSizeFractionElement = document.getElementById('batchSizeFraction');
export const getBatchSizeFraction = () => +batchSizeFractionElement.value;

const epochsElement = document.getElementById('epochs');
export const getEpochs = () => +epochsElement.value;

const denseUnitsElement = document.getElementById('dense-units');
export const getDenseUnits = () => +denseUnitsElement.value;
const statusElement = document.getElementById('status');

// const yes1 = document.getElementById('yes1');
// const yes2 = document.getElementById('yes2');
// const ok = document.getElementById('ok');
// const no = document.getElementById('no');

var last_status = 'fail';
export function logout () {
  last_status = 'fail';
}

export function predictClass(classId) {
  let current_status = PASS_STATUS[classId];
  document.body.setAttribute('data-active', CONTROLS[classId]);

  if ((last_status === 'fail' && current_status === 'yes1') ||
      (last_status === 'yes1' && current_status === 'yes2') ||
      (last_status === 'yes2' && current_status === 'ok')) {
    last_status = current_status;
    document.body.setAttribute('data-status', current_status);
  }
  // if (classId === 0) {
  //   yes.classList.add('show');
  //   yes.classList.remove('ninja');
  //   no.classList.add('ninja');
  //   no.classList.remove('show');
  // } else {
  //   no.classList.add('show');
  //   no.classList.remove('ninja');
  //   yes.classList.add('ninja');
  //   yes.classList.remove('show');
  // }
}

export function isPredicting() {
  console.log("PREDICTING!");
  statusElement.style.visibility = 'visible';
  // loggedInElement.classList.add('show');
  // loggedInElement.classList.remove('ninja');
}
export function donePredicting() {
  console.log("NO LONGER PREDICTING!");
  statusElement.style.visibility = 'hidden';
  // loggedInElement.classList.remove('show');
  // loggedInElement.classList.add('ninja');
}
export function trainStatus(status) {
  trainStatusElement.innerText = status;
}

export let addExampleHandler;
export function setExampleHandler(handler) {
  addExampleHandler = handler;
}
let mouseDown = false;
const totals = [0, 0, 0, 0];

const upButton = document.getElementById('up');
const downButton = document.getElementById('down');
const leftButton = document.getElementById('left');
const rightButton = document.getElementById('right');
const captureButton = document.getElementById('capture-button')

const thumbDisplayed = {};

async function handler(label) {
  mouseDown = true;
  const className = CONTROLS[label];
  const button = document.getElementById(className);
  const total = document.getElementById(className + '-total');
  while (mouseDown) {
    addExampleHandler(label);
    document.body.setAttribute('data-active', CONTROLS[label]);
    total.innerText = totals[label]++;
    await tf.nextFrame();
  }
  document.body.removeAttribute('data-active');
}

const numLabels = ['first', 'second', 'third']

let currentSign = 0
let currentTotal = 0
const TARGET_COUNT = 10
async function handleNextSign() {
  captureButton.disabled = true
  const progressBar = document.createElement('div')
  progressBar.style.width = 0
  progressBar.classList = 'progress-bar'
  captureButton.innerHTML = ''
  captureButton.appendChild(progressBar)
  currentTotal = 0
  const button = document.getElementById('up')
  const total = document.getElementById('up-total')
  while (currentTotal <= TARGET_COUNT) {
    addExampleHandler(currentSign)
    document.body.setAttribute('data-active', CONTROLS[currentSign])
    total.innerText = currentTotal++
    progressBar.style.width = (currentTotal / TARGET_COUNT * 100) + '%'
    await tf.nextFrame()
  }
  document.body.removeAttribute('data-active')
  currentSign++
  if (currentSign > 3) {
    captureButton.innerHTML = 'Signs recorded. Train and enjoy secure living.'
    captureButton.classList.add('done')
  } else {
    captureButton.innerHTML = currentSign < 3
      ? `Capture ${numLabels[currentSign]} sign`
      : 'Record some noise for science'
    captureButton.disabled = false
  }
}

upButton.addEventListener('mousedown', () => handler(0));
upButton.addEventListener('mouseup', () => mouseDown = false);

downButton.addEventListener('mousedown', () => handler(1));
downButton.addEventListener('mouseup', () => mouseDown = false);

leftButton.addEventListener('mousedown', () => handler(2));
leftButton.addEventListener('mouseup', () => mouseDown = false);

rightButton.addEventListener('mousedown', () => handler(3));
rightButton.addEventListener('mouseup', () => mouseDown = false);

captureButton.addEventListener('click', handleNextSign)

export function drawThumb(img, label) {
  if (thumbDisplayed[label] == null) {
    const thumbCanvas = document.getElementById(CONTROLS[label] + '-thumb');
    draw(img, thumbCanvas);
  }
}

export function draw(image, canvas) {
  const [width, height] = [224, 224];
  const ctx = canvas.getContext('2d');
  const imageData = new ImageData(width, height);
  const data = image.dataSync();
  for (let i = 0; i < height * width; ++i) {
    const j = i * 4;
    imageData.data[j + 0] = (data[i * 3 + 0] + 1) * 127;
    imageData.data[j + 1] = (data[i * 3 + 1] + 1) * 127;
    imageData.data[j + 2] = (data[i * 3 + 2] + 1) * 127;
    imageData.data[j + 3] = 255;
  }
  ctx.putImageData(imageData, 0, 0);
}
