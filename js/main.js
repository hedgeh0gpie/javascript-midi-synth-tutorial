"use strict";

if (navigator.requestMIDIAccess) {
  navigator.requestMIDIAccess().then(success, failure);
}

function success(midiAccess) {
  // console.log(midiAccess);

  // Two ways to do the same thing
  // midiAccess.onstatechange = updateDevices;
  midiAccess.addEventListener('statechange', updateDevices);

  const inputs = midiAccess.inputs;
  // console.log(inputs);

  inputs.forEach((input) => {
    // console.log(input);

    // Two ways to do the same thing
    // input.onmidimessage = handleInput;
    input.addEventListener('midimessage', handleInput);
  })
}

function handleInput(input) {
  // console.log(input);

  const command = input.data[0];
  const note = input.data[1];
  const velocity = input.data[2];

  // console.log(command, note, velocity);

  switch (command) {
    case 144: // noteOn
      if (velocity > 0) {
        // note is on
        noteOn(note, velocity);
      } else {
        // note is off
        noteOff(note);
      }
      break;
    case 128: // noteOff
      // note is off
      noteOff(note);
      break;
  }
}

function noteOn(note, velocity) {
  console.log(note, velocity);
}

function noteOff(note) {
  console.log(note);
}

function updateDevices(event) {
  // console.log(event);
  console.log(`Name: ${event.port.name}, Brand: ${event.port.manufacturer}, State: ${event.port.state}, Type: ${event.port.type}`);
}

function failure() {
  console.log('Could not connect MIDI');
}
