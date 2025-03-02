let currentSong = new Audio();
let currentIndex = 0; // Track current song index
let songs = []; // Store the song list
let crrFolder;
function convertSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) return "loading";

  let minutes = Math.floor(seconds / 60);
  let remainingSeconds = Math.floor(seconds % 60);

  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

async function getSongs(folder) {
  crrFolder  =folder;

  let response = await (await fetch(`http://127.0.0.1:3000/${folder}/`)).text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
 songs = [];

  for (let element of as) {
    if (element.href.endsWith(".mp3")) {
        songs.push(element.href.split(`${folder}`)[1]);

    }
   
  }
  let songUL = document.querySelector(".songList ul");
  songUL.innerHTML = "";
  for (const song of songs) {
    songUL.innerHTML += `
      <li>
        <img src="https://img.icons8.com/?size=100&id=mpeojql23sni&format=png&color=FFFFFF" alt="">
        <div class="info">
          <div class = "songName" >${song}</div>
          <div>Artist Name</div>
        </div>
        <div class="playnow">
          <span>Play Now</span>
          <img src="https://img.icons8.com/?size=100&id=36067&format=png&color=FFFFFF" alt="">
        </div>
      </li>`;
  }

  document.querySelectorAll(".songList li").forEach((e, index) => {
    e.addEventListener("click", () => {
      currentIndex = index;
      playMusic(songs[currentIndex]);
    });
  });
}

const playMusic = (track, pause = false) => {
  currentSong.src =`${crrFolder}` + track;
  if (!pause) {
    currentSong.play();
    document.querySelector("#play").src =
      "https://img.icons8.com/?size=100&id=QwQkX0mWfS6F&format=png&color=FFFFFF";
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songTime").innerHTML = "00:00";
  document.querySelector(".total-duration").innerHTML = "00:00";
};

async function main() {
  await getSongs("songs/ncs");
  console.log(songs);
  playMusic(songs[currentIndex], true);


  
 

  document.querySelector("#next").addEventListener("click", playNext);
  document.querySelector("#previous").addEventListener("click", playPrevious);

  document.querySelector("#play").addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      document.querySelector("#play").src =
        "https://img.icons8.com/?size=100&id=QwQkX0mWfS6F&format=png&color=FFFFFF";
    } else {
      currentSong.pause();
      document.querySelector("#play").src =
        "https://img.icons8.com/?size=100&id=rO5ATRDGnabW&format=png&color=FFFFFF";
    }
  });

  currentSong.addEventListener("ended", playNext);

  currentSong.addEventListener("timeupdate", () => {
    let progress = (currentSong.currentTime / currentSong.duration) * 100;
    document.querySelector(".songTime").innerHTML = `${convertSeconds(currentSong.currentTime)}`;

    document.querySelector(".total-duration").innerHTML = `${convertSeconds(currentSong.duration)}`;

    document.querySelector(".seekball").style.left = progress + "%";
    document.querySelector(".seekbar").style.background = `linear-gradient(to right, rgb(35, 186, 45) ${progress}%, #ccc ${progress}%)`;
  });

  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".seekball").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  document.querySelector(".close-icon").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-100%";
  });



  const volumeIcon = document.querySelector(".volume-icon");
const volumeSlider = document.querySelector(".range");
const volPercent = document.querySelector(".vol-percent"); // Volume percentage display

// Function to update volume
function updateVolume() {
  let volumeValue = volumeSlider.value / 100;
  currentSong.volume = volumeValue;
  volPercent.innerText = `${volumeSlider.value}%`; // Update percentage text

  // Change background fill dynamically
  volumeSlider.style.background = `linear-gradient(to right, orange ${volumeSlider.value}%, #ccc ${volumeSlider.value}%)`;

  // Auto-update mute/unmute icon based on volume
  if (volumeValue === 0) {
    currentSong.muted = true;
    volumeIcon.src = "https://img.icons8.com/?size=100&id=9976&format=png&color=FFFFFF"; // Change to mute icon
  } else {
    currentSong.muted = false;
    volumeIcon.src = "https://img.icons8.com/?size=100&id=9980&format=png&color=FFFFFF"; // Change to unmute icon
  }
}

// Mute/unmute on icon click
volumeIcon.addEventListener("click", () => {
  if (currentSong.muted || currentSong.volume === 0) {
    currentSong.muted = false;
    volumeSlider.value = currentSong.volume * 100 || 50; // Restore to 50% if previously 0
    volumeIcon.src = "https://img.icons8.com/?size=100&id=9980&format=png&color=FFFFFF"; // Change to unmute icon
  } else {
    currentSong.muted = true;
    volumeSlider.value = 0; // Set volume to 0
    volumeIcon.src = "https://img.icons8.com/?size=100&id=9976&format=png&color=FFFFFF"; // Change to mute icon
  }

  updateVolume(); // Apply changes
});

// Listen to volume slider changes
volumeSlider.addEventListener("input", updateVolume);


Array.from(document.getElementsByClassName("card")).forEach(e => {
  e.addEventListener("click", async item => {
    await getSongs(`songs/${item.currentTarget.dataset.folder}`);
    
    // Reset currentIndex to the first song in the new folder
    currentIndex = 0;

    // Play the first song in the new folder
   
  });
});

  
}

const playNext = () => {
  currentIndex = (currentIndex + 1) % songs.length;
  playMusic(songs[currentIndex]);
};

const playPrevious = () => {
  currentIndex = (currentIndex - 1 + songs.length) % songs.length;
  playMusic(songs[currentIndex]);
};

main();
