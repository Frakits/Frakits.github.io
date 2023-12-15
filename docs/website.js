
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
		let trueGameDiv = await newgameDiv.querySelector(".game");
		resolve(newgameDiv);
		newgameDiv.href = `https://www.roblox.com/games/${value.id}`
		trueGameDiv.querySelector(".game-score-text").textContent = `score ${value.scr.toFixed(2)}`
		trueGameDiv.querySelector(".game-text").textContent = value.n;
		trueGameDiv.title = value.n;
		trueGameDiv.querySelector(".game-thumbnail").src = `https://raw.githubusercontent.com/Frakits/Frakits.github.io/main/roblox%20icons/${value.uid}.png`;
	});
}
function makeTemplate() {
	let gameDivTemplate = document.createElement("a");
	gameDivTemplate.target = `blank`;
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
	gameDivTemplate.appendChild(gameDiv);
	return gameDivTemplate;
}
