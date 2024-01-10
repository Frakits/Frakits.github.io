
let gamelist = null;
let mainpage = document.querySelector(".main-page");
let tagspages = null;
let gameInfo = [];
fetch("https://raw.githubusercontent.com/Frakits/Frakits.github.io/main/final_listv2.json").then(response => {
	response.json().then(async j => {
		gamelist = j;
		let dropdown = document.querySelector(".game-tags-dropdown")
		let defaultOption = document.createElement("option")
		defaultOption.value = "All";
		defaultOption.innerText = "All";
		defaultOption.className = "game-tags-dropdown-option";
		dropdown.appendChild(defaultOption);
		dropdown.addEventListener("change", function() {
			generateTagsPage(dropdown.value);
		})
		let tagarays = [];
		for (tag of j.tagsList) {
			let option = document.createElement("option")
			option.value = tag;
			option.innerText = tag;
			option.className = "game-tags-dropdown-option";
			dropdown.appendChild(option);
			let tagDiv = document.createElement("Div");
			tagDiv.id = tag;
			tagDiv.className = "game-tag-page";
			tagarays.push([tag, tagDiv]);
		}
		tagspages = new Map(tagarays);
		console.log(tagspages);
		Object.entries(gamelist).forEach(async ([key, games]) => {
			if (key == "tagsList") return;
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
				document.body.querySelector(".main-page").appendChild(div);
				category.addEventListener("scroll", e=>{handleScroll(category)})
			} else div = document.getElementById(key);
			for await (game of games) {
				let taggers = Array.from(game.t);
				//let spliceAmount = key == "Main Games" ? 600 : 30;
				//games = games.splice(spliceAmount, games.length - spliceAmount)
				makeGameDiv(game).then(gamediv => {
					div.querySelector('.game-category').appendChild(gamediv)
					gameInfo.push([gamediv, [taggers, div.querySelector('.game-category')]]);
				});
			}
		})
		document.querySelector(".fullscreen").style.opacity = 0;
		document.querySelector(".fullscreen").style.pointerEvents = "none";
	});
});
let template;
template = makeTemplate();
async function makeGameDiv(value) {
	return new Promise(async (resolve, reject) => {
		let newgameDiv = await template.cloneNode(true);
		if (value.t.includes("Hall Of Fame")) {
			newgameDiv.id = "recommend"
			let shine = document.createElement("img");
			shine.src = "https://cdn.discordapp.com/attachments/1192569026505879653/1192772884398100524/ezgif-3-a995a4906f.gif?ex=65aa4b50&is=6597d650&hm=1fb4c739f8c715ecfaaa2b75bfd663bfabe3c32979c9def83aac5e7dbc8857cb&";
			shine.classList.add("game-shine");
			shine.classList.add("gif")
			newgameDiv.appendChild(shine);
		}
		newgameDiv.addEventListener('click', function(e) {
			window.open(`https://www.roblox.com/games/${value.id}`, 'blank');
			return false;
		});
		newgameDiv.querySelector(".game-play").onclick = e => {
			window.open(`roblox://placeId=${value.id}`, "_self");
			e.stopPropagation();
		}
		let tagGroup = document.createElement("Div");
		tagGroup.className = "game-tag-group";
		newgameDiv.appendChild(tagGroup);
		for (tag of value.t) createTag(tag).then(tag => tagGroup.appendChild(tag));
		newgameDiv.querySelector(".game-text").textContent = value.n;
		newgameDiv.title = value.n;
		newgameDiv.querySelector(".game-thumbnail").src = `https://raw.githubusercontent.com/Frakits/Frakits.github.io/main/roblox%20icons/${value.uid}.webp`;
		if (value.t.includes("New To List")) {
			let newDiv = await document.createElement("Div");
			newDiv.className = "game-new-tag";
			newDiv.textContent = "NEW";
			newgameDiv.insertBefore(newDiv, newgameDiv.querySelector(".game-thumbnail"));
		}
		resolve(newgameDiv);
	});
}
async function createTag(tag) {
	return new Promise(async (resolve, reject) => {
		let colors = new Map([
			["Hall Of Fame", "#ffd900"],
			["New To List", "#d42a2a"],
			["Adventure", "#008cff"],
			["All", "#616161"],
			["Sports", "#6fe640"],
			["Fighting", "#a31515"],
			["RPG", "#37c493"],
			["FPS", "#db5a23"],
			["Military", "#235215"],
			["Sci-Fi", "#529c95"],
			["Comedy", "#6f1ab0"],
			["Horror", "#5c5b3e"],
			["Town and City", "#7dba1c"],
			["Building", "#804620"],
			["Naval", "#1a2a40"],
			["Western", "#854e14"]
		]);
		let tagDiv = await document.createElement("Div");
		tagDiv.title = "Click to search games of this tag"
		tagDiv.className = "game-tag";
		tagDiv.textContent = tag;
		tagDiv.style.background = colors.get(tag);
		tagDiv.addEventListener("click", e => {
			document.querySelector(".game-tags-dropdown").value = tag;
			document.querySelector(".game-tags-dropdown").dispatchEvent(new Event('change'));
			e.stopPropagation();
		});
		resolve(tagDiv)
	})
}
function makeTemplate() {
	let gameDiv = document.createElement("Div");
	gameDiv.className = "game";
	let img = document.createElement("img");
	img.className = "game-thumbnail";
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
	play.title = "Open Game Using Deeplink.";
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

async function generateTagsPage(tag) {
	for ([key, tagser] of tagspages)
		if (tagser.parentElement == document.body) document.body.removeChild(tagser);
	console.log("H");
	if (tag != "All") {
		if (mainpage.parentElement == document.body) document.body.removeChild(mainpage);
		document.body.appendChild(tagspages.get(tag))
		for (game of gameInfo) {
			if (game[1][0].includes(tag)) tagspages.get(tag).appendChild(game[0]);
		}
	}
	else {
		document.body.appendChild(mainpage);
		for (game of gameInfo) {
			game[1][1].appendChild(game[0]);
		}
	}
}

async function handleScroll(div) {
	console.log("scrolled");
	for (game of div.children) {
		game.style.visibility = div.scrollTop > game.getBoundingClientRect().top + game.offsetTop ? "hidden" : "visible"
	}
}