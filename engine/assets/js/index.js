import $ from 'jquery';
import LocalIdentity from './networking/LocalIdentity.js';
import Game from './gameplay/Game.js';

$(document).bind("contextmenu", (e) => false);

$(document).ready(() => {
    // Initialise the game
    const localIdentity = new LocalIdentity();
    window.game = new Game(localIdentity, true);
    game.start();
});