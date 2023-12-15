let gamelist = null;
let button = document.querySelector(".show-more");
let maindiv = document.querySelector(".main-page");
let futureGames = [];
let maxGames = 50;
button.onclick = () => showMore(gamelist);
button.style.visibility = 'hidden';
fetch("../final_list.json").then(response => {
	response.json().then(async j => {
		gamelist = chunk(j, maxGames);
		showMore(gamelist);
	});

});

function showMore(j) {
	button.style.visibility = "hidden";
	if (futureGames.length > 0) {
		for (div of futureGames)
			maindiv.appendChild(div);
		if (futureGames.length == maxGames) button.style.visibility = 'visible';
		futureGames = [];
	}
	else {
		Object.entries(j[0]).forEach(([key, value]) => makeGameDiv(value).then(div => maindiv.appendChild(div)));
		button.style.visibility = 'visible';
	}
	j.splice(0, 1);
	Object.entries(j[0]).forEach(async ([key, value]) => makeGameDiv(value).then(div => {
		if (button.style.visibility == "hidden") {
			maindiv.appendChild(div)
			if (key == maxGames-1) button.style.visibility = 'visible';
		}
		else futureGames.push(div)
	}));
}
function chunk(arr, size) {
	return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
    	arr.slice(i * size, i * size + size)
  	);
}
async function makeGameDiv(value) {
	return new Promise(async (resolve, reject) => {
		let div = document.createElement("Div");
		div.className = "game";
		let img = document.createElement("img");
		img.className = "game-thumbnail";
		fetch(`http://localhost:8010/proxy/v1/games/icons?universeIds=${value.uid}&returnPolicy=PlaceHolder&size=150x150&format=Png&isCircular=false`, {mode: 'cors'}).then(async response => {
			response.json().then(async j => {
				img.setAttribute("loading", "lazy");
				img.width = 150;
				img.src = j.data[0].imageUrl;
				img.crossOrigin = "anonymous";
				div.appendChild(img);
				let name = document.createElement("Div");
				name.textContent = value.n;
				name.className = "game-text";
				div.appendChild(name);
				let score = document.createElement("Div");
				score.textContent = `score ${value.scr.toFixed(2)}`
				div.appendChild(score);
				let a = document.createElement("a");
				a.href = `https://www.roblox.com/games/${value.id}`
				a.target = `blank`;
				a.appendChild(div);
				await resolve(a);
			});
		});
	});
}