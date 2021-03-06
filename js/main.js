"use strict";

window.AudioContext = window.AudioContext || window.webkitAudioContext;
let ctx = new AudioContext();
const startButton = document.querySelector('button');
const oscillators = {};

startButton.addEventListener('click', () => {
    ctx = new AudioContext();
    console.log(ctx);
})

function midiToFreq(number) {
    const a = 440;
    return (a / 32) * (2 ** ((number - 9) / 12));
}

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

    const osc = ctx.createOscillator();

    const oscGain = ctx.createGain();
    oscGain.gain.value = 0.33;

    const velocityGainAmount = (1 / 127) * velocity;
    const velocityGain = ctx.createGain();
    velocityGain.gain.value = velocityGainAmount;

    osc.type = 'sine';
    osc.frequency.value = midiToFreq(note);

    osc.connect(oscGain);
    oscGain.connect(velocityGain);
    velocityGain.connect(ctx.destination);

    osc.gain = oscGain;
    console.log(osc);
    oscillators[note.toString()] = osc;
    console.log(oscillators);
    osc.start();
}

function noteOff(note) {
    console.log(note);

    const osc = oscillators[note.toString()];
    const oscGain = osc.gain;

    // Fade out notes to prevent clicks
    oscGain.gain.setValueAtTime(oscGain.gain.value, ctx.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.03);

    // Garbage collector
    setTimeout(() =>{
        osc.stop();
        osc.disconnect();
    }, 20);


    delete oscillators[note.toString()];
    console.log(oscillators);

}

function updateDevices(event) {
    // console.log(event);
    console.log(`Name: ${event.port.name}, Brand: ${event.port.manufacturer}, State: ${event.port.state}, Type: ${event.port.type}`);
}

function failure() {
    console.log('Could not connect MIDI');
}
