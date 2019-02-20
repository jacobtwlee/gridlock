$(window).on("load", function () {
    var socket = io();
    
    socket.on('ack', function (data) {
        startGame(socket, data);
    });
});

function startGame(socket, data) {
    var X_TILES = data.width;
    var Y_TILES = data.height;
    var TILE_SIZE = 20;
    
    var game = new Phaser.Game(X_TILES * TILE_SIZE, Y_TILES * TILE_SIZE, Phaser.AUTO, 'gridlock', {
        preload: preload,
        create: create,
        update: update
    });
    
    var players = {};
    var playerColor = 0;
    
    var color = new ColorController();
    
    color.change(function (hue) {
        color.setbg(hue);
        playerColor = color.hex(hue);
        updateScores(scoreData);
    });
    
    $("#name-picker").on("keydown", function (e) {
        if (e.which === 13) {
            var name = $(this).val().replace(/\W+/g, '');
            
            if (name.length == 0) {
                return;
            } 
            
            $(this).val("");
            $(this).attr("placeholder", name);
            socket.emit("name", {name: name})
        }
    });
    
    var tileGroup;
    var tiles = [];
    
    var tileData;
    var scoreData;

    function preload() {
        this.game.load.image('tile', 'img/tile.png');
    }
    

    function create() {
        game.stage.backgroundColor = "ffffff";
        
        initTiles();
        drawTitle();
        
        socket.emit("ready", {name: "anonymous"});
        
        
        socket.on('update', function (data) {
            tileData = data;
        });
        
        socket.on('score', updateScores);
    }

    function update() {
        renderTiles();
    }
    
    function initTiles() {
        tileGroup = game.add.group();
        
        for (var i = 0; i < X_TILES; i++) {
            tiles.push([]);
            
            for (var j = 0; j < Y_TILES; j++) {
                var x = i * TILE_SIZE;
                var y = j * TILE_SIZE;
                
                var tile = tileGroup.create(x, y, 'tile');
                
                tile.width = TILE_SIZE;
                tile.height = TILE_SIZE;
                tile.row = i;
                tile.col = j;
                
                tile.inputEnabled = true;
                tile.events.onInputOver.add(tileInputOver, tile);
                tile.events.onInputOut.add(tileInputOut, tile);
                tile.events.onInputDown.add(tileInputDown, tile);
                
                tiles[i].push(tile);
            }
        }
    }
    
    function renderTiles() {
        if (tileData) {
            for (var x = 0; x < X_TILES; x++) {
                for (var y = 0; y < Y_TILES; y++) {
                    fillTile(x, y, tileData[x][y]);
                }
            }
        }
    }
    
    function updateScores(data) {
        scoreData = data;
        
        var $scores = $(".scores").empty();
        
        for (var i = 0; i < data.length; i++) {
            var hexStr = getPlayerColor(data[i].id).toString(16);
            var color = "#" + "0".repeat(6 - hexStr.length) + hexStr;
            
            var $row = $(`
                <div class="score-row">
                    <div class="name" style="color: ${color}">${data[i].name}</div>
                    <div class="score">${data[i].score}</div>
                </div>
            `);
            
            $row.find
            
            
            $scores.append($row);
        }
    }
    
    function tileInputDown(tile, pointer) {
        socket.emit('tileClick', {
            x: tile.row,
            y: tile.col
        });        
    }
    
    function tileInputOver(tile, pointer) {
        if (tile.tween) {
            game.tweens.remove(tile.tween);
        }
        
        tile.alpha = 0.6;
    }
    
    function tileInputOut(tile, pointer) {
        tile.tween = game.add.tween(tile).to({alpha:1}, 500, Phaser.Easing.Linear.In, true);
    }
    
    function fillTile(x, y, id) {
        var fillColor;
        
        if (!id) {
            // empty tile
            fillColor = 0xFFFFFF;
        } else {
            fillColor = getPlayerColor(id);
        }
        
        tiles[x][y].tint = fillColor;
    }
    
    function getPlayerColor(id) {
        if (id === socket.id) {
            return playerColor;
        }
        
        if (!(id in players)) {
            players[id] = {
                color: color.randomColor()
            };
        }
        
        return players[id].color;
    }
    
    function drawTitle() {
        var titleTiles = [
            [1,1,1, 0, 1,1,1, 0, 1,1,1, 0, 1,1,0, 0, 1,0,0, 0, 1,1,1, 0, 1,1,1, 0, 1,0,1],
            [1,0,0, 0, 1,0,1, 0, 0,1,0, 0, 1,0,1, 0, 1,0,0, 0, 1,0,1, 0, 1,0,0, 0, 1,0,1],
            [1,0,1, 0, 1,1,0, 0, 0,1,0, 0, 1,0,1, 0, 1,0,0, 0, 1,0,1, 0, 1,0,0, 0, 1,1,0],
            [1,1,1, 0, 1,0,1, 0, 1,1,1, 0, 1,1,0, 0, 1,1,1, 0, 1,1,1, 0, 1,1,1, 0, 1,0,1]
        ];
        
        var startX = Math.floor((X_TILES - titleTiles[0].length) / 2);
        var startY = Math.floor((Y_TILES - titleTiles.length) / 2);
        
        for (var i = 0; i < titleTiles[0].length; i++) {
            for (var j = 0; j < titleTiles.length; j++) {
                var x = i + startX;
                var y = j + startY;
                
                if (titleTiles[j][i]) {
                    var duration = 1000 + (2000 * i/titleTiles[0].length) + (2000 * j/titleTiles.length);
                    tiles[x][y].tween = game.add.tween(tiles[x][y]).to({alpha:0.7}, duration, Phaser.Easing.Linear.In, true);
                }
            }
        }
    }
}