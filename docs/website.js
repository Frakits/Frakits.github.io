
let gamelist = null;
fetch("https://raw.githubusercontent.com/Frakits/Frakits.github.io/main/final_listv2.json").then(response => {
	response.json().then(async j => {
		gamelist = j;
		Object.entries(gamelist).forEach(async ([key, games]) => {
			let div = null;
			if (document.getElementById(key) == null) {
				let category = document.createElement("Div");
				category.className = "game-category";
				let text = document.createElement("p");
				text.textContent = key;
				text.className = "game-category-text";
				div = document.createElement("Div");
				div.id = key;
				div.appendChild(text);
				div.appendChild(category);
				document.body.appendChild(div);
			} else div = document.getElementById(key);
			for await (game of games) {
				let spliceAmount = key == "Main Games" ? 600 : 30;
				games = games.splice(spliceAmount, games.length - spliceAmount)
				makeGameDiv(game).then(gamediv => div.querySelector('.game-category').appendChild(gamediv));
			}
		})
	});

});
let template;
template = makeTemplate();
async function makeGameDiv(value) {
	return new Promise(async (resolve, reject) => {
		let newgameDiv = await template.cloneNode(true);
		resolve(newgameDiv);
		newgameDiv.addEventListener('click', function(e) {
			window.open(`https://www.roblox.com/games/${value.id}`, 'blank');
			return false;
		});
		newgameDiv.querySelector(".game-play").onclick = e => {
			window.open(`roblox://placeId=${value.id}`, "_self");
			e.stopPropagation();
		}
		newgameDiv.querySelector(".game-score-text").textContent = `active: ${value.pls}`
		newgameDiv.querySelector(".game-text").textContent = value.n;
		newgameDiv.title = value.n;
		newgameDiv.querySelector(".game-thumbnail").src = `https://raw.githubusercontent.com/Frakits/Frakits.github.io/main/roblox%20icons/${value.uid}.png`;
		if (value.new) {
			let newDiv = await document.createElement("Div");
			newDiv.className = "game-new-tag";
			newDiv.textContent = "NEW";
			newgameDiv.insertBefore(newDiv, newgameDiv.querySelector(".game-thumbnail"));
		}
	});
}
function makeTemplate() {
	let gameDiv = document.createElement("Div");
	gameDiv.className = "game";
	let img = document.createElement("img");
	img.className = "game-thumbnail";
	img.setAttribute("loading", "lazy");
	img.src = "https://cdn.discordapp.com/attachments/1127629189793722448/1184536209716953108/loading-63.gif?ex=658c5450&is=6579df50&hm=0321032d68ec41182f8f9393564d2382546f0315954f154b0eebfc3f9236e5ab&";
	img.width = 150;
	img.height = 150;
	img.crossOrigin = "anonymous";
	gameDiv.appendChild(img);
	let gamename = document.createElement("Div");
	gamename.className = "game-text";
	gameDiv.appendChild(gamename);
	let score = document.createElement("Div");
	score.className = "game-score-text";
	gameDiv.appendChild(score);
	let play = document.createElement("Div");
	play.target = `blank`;
	play.className = "game-play"
	play.title = "Open Link To Roblox";
	let playimg = document.createElement("img")
	playimg.src = "https://raw.githubusercontent.com/Frakits/Frakits.github.io/main/docs/svg/play-button.svg"
	playimg.className = "link-graphic"
	play.appendChild(playimg);
	gameDiv.appendChild(play);
	return gameDiv;
}
let curMargin = 0;
function openGameInfo(json) {
	document.querySelector(".fullscreen").style.visibility = "visible";
	document.querySelector(".game-display-images").style.gridTemplateColumns = `repeat(${json.media.length}, 100%)`
	document.querySelector(".game-display-infos-play").href = `https://www.roblox.com/games/${json.id}`
	document.querySelector(".game-display-infos-name").textContent = json.n;
	document.querySelector(".game-display-infos-creator").href = (json.ct == "Group" ? `https://www.roblox.com/users/${json.cid}/profile` : `https://www.roblox.com/groups/${json.cid}`)
	document.querySelector(".game-display-infos-creator").textContent = json.cn;
	for (media of json.media) {
		if (typeof media == 'string') {
			let video = document.createElement("iframe")
			video.src = `https://www.youtube.com/embed/${media}`
			video.className = "game-display-thumbnail";
			video.frameBorder = "0"
			document.querySelector(".game-display-images").appendChild(video);
		}
		else {
			let img = document.createElement("img");
			img.className = "game-display-thumbnail"
			img.src = `https://raw.githubusercontent.com/Frakits/Frakits.github.io/main/roblox icons/${json.uid}-media/${media}.png`;
			document.querySelector(".game-display-images").appendChild(img);
		}
	}
	document.getElementById("LEFT").onclick = function() {
		curMargin += 100;
		curMargin =	curMargin.wrap(-100 * (document.querySelector(".game-display-images").children.length-1), 0);
		for (img of document.querySelectorAll(".game-display-thumbnail")) {
			img.style.marginLeft = `${curMargin}%`;
		}
	}
	document.getElementById("RIGHT").onclick = function() {
		curMargin -= 100;
		curMargin =	curMargin.wrap(-100 * (document.querySelector(".game-display-images").children.length-1), 0);
		for (img of document.querySelectorAll(".game-display-thumbnail")) {
			img.style.marginLeft = `${curMargin}%`;
		}
	}
	curMargin = 0;
	document.querySelector(".game-display-x").onclick = function() {
		while (document.querySelector(".game-display-images").firstChild) {
			document.querySelector(".game-display-images").removeChild(document.querySelector(".game-display-images").firstChild);
		}
		document.querySelector(".fullscreen").style.visibility = "hidden";
		return false;
	}
}

Number.prototype.wrap = function( low, high ) {
	let number = this;
	if (number < low) number = high;
	if (number > high) number = low
	return number;
}