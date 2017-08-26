import $ from 'jquery';
import LocalIdentity from './networking/LocalIdentity.js';
import Game from './gameplay/Game.js';

$(document).ready(() => {
    // Initialise the game
    var localIdentity = new LocalIdentity();
    window.game = new Game(localIdentity, true);
    game.start();
});