var gridlock = {};

// constants
var X_TILES = 59;
var Y_TILES = 40;

// private fields
var tiles = [];
var users = {};

// populate the tile grid with empty spaces
gridlock.init = function () {
    for (var x = 0; x < X_TILES; x++) {
        tiles.push([]);
        for (var y = 0; y < Y_TILES; y++) {
            tiles[x].push(null);
        }
    }
    
    return gridlock;
};

// return the 2d array of tiles
gridlock.tiles = function () {
    return tiles;
};

// set the tile at the specified indexes
gridlock.update = function (x, y, id) {
    tiles[x][y] = id;
};

// scores:
// return an array of score objects sorted by score
// we could probably store scores and only perform updates when needed, but this
// is fine for now and saves the headache of ensuring consistency
gridlock.scores = function () {
    var scoresObj = {};
    var scoresArr = [];
    
    this.each(function (x, y) {
        var id = tiles[x][y];
        
        if (!id) return;
        
        if (!(id in scoresObj)) {
            scoresObj[id] = 0;
        }
        
        scoresObj[id] += 1;
    });
    
    for (var id in users) {
        var score = scoresObj[id] || 0;
        
        scoresArr.push({
            score: score,
            id: id,
            name: users[id].name
        });
    }
    
    scoresArr.sort(function (a, b) {
        return b.score - a.score;
    });
        
    return scoresArr;
};

// add a new user
gridlock.addUser = function (id, name) {
    users[id] = {
        name: name
    };
};

// remove a user from the game
gridlock.removeUser = function (id) {
    this.each(function (x, y) {
        if (tiles[x][y] == id) {
            this.update(x, y, null);
        }
    });
    
    delete users[id];
};

// change username
gridlock.setName = function (id, name) {
    users[id].name = name;
};

// return an object containing some global game parameters
gridlock.params = function () {
    return {
        width: X_TILES,
        height: Y_TILES
    }
};

// call the given function for each tile in the grid
gridlock.each = function (fun) {
    for (var x = 0; x < X_TILES; x++) {
        for (var y = 0; y < Y_TILES; y++) {
            fun.call(this, x, y);
        }
    }
}

module.exports = gridlock;