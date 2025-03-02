console.log('lets write some JavaScript')

let currentSong = new Audio();
let songs;
let currFolder;

function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)

    const formattedMinutes = String(minutes).padStart(2, "0")
    const formattedSeconds = String(remainingSeconds).padStart(2, "0")

    return `${formattedMinutes}:${formattedSeconds}`

}



async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${folder}/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response
    let as = div.getElementsByTagName('a')
    songs = []

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith('.mp3')) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    // show all the songs in the playlist
    let songUl = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songUl.innerHTML = ""
    for (const song of songs) {
        songUl.innerHTML = songUl.innerHTML + `<li>
                            <img class="invert" src="img/music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll('%20', " ")}</div>
                                <div>Sumit kashyap</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="img/play.svg" alt="">
                            </div> </li>`;
    }

    // attach an event listener to each song
    Array.from(document.querySelector('.songlist').getElementsByTagName('li')).forEach(e => {
        e.addEventListener("click", element => {
            // console.log(e.querySelector('.info').firstElementChild.innerHTML)
            playMusic(e.querySelector('.info').firstElementChild.innerHTML.trim()) // trim to remove space

        })
    })

    return songs;





}
const playMusic = (track, pause = false) => {

    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = "img/pause.svg"
    }

    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00/00:00"

}

async function displayAlbums() {
    let a = await fetch(`/songs/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-2)[0]

            // Get the metaData of the folder
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json();
            console.log(response)
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                <div class="play">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48">
                <!-- Green Circle -->
                <circle cx="12" cy="12" r="10" fill="#1ED760" />
                <!-- Play Button -->
                <path d="M9 7L16 12L9 17V7Z" fill="black" />
                </svg>
                
                
                </div>
                <img src="/songs/${folder}/cover.jpg" alt="image">
                <h2>${response.title}</h2>
                <p>${response.description}</p>
                </div> `
        }
        // load the library whenever its clicked!!
        Array.from(document.getElementsByClassName("card")).forEach(e => {
            e.addEventListener("click", async item => {
                songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
                playMusic(songs[0])

            })
        })
    }
    
}




async function main() {


    // get the list of all the songs
    await getSongs("songs/ncs")
    playMusic(songs[0], true)

    // display all the albums on the page
    displayAlbums();



    // attach an event listener in play , next and previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })




    // listen for time update event
    currentSong.addEventListener("timeupdate", () => {
        // console.log(currentSong.currentTime , currentSong.duration)
        document.querySelector(".songtime").innerHTML = `${formatTime(currentSong.currentTime)}:${formatTime(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";

    })

    // add an event listener to the seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent / 100)
    })

    // add an event listener to the Hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    // add an event listener to the close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    // add an event listener to the previous 
    previous.addEventListener("click", () => {
        currentSong.pause()
        // console.log("previous clicked")

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if (index - 1 >= 0) {
            playMusic(songs[index - 1])
        }

    })
    // add an event listener to the Next 
    next.addEventListener("click", () => {
        currentSong.pause()
        // console.log("Next clicked")

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if (index + 1 < songs.length) {
            playMusic(songs[index + 1])
        }

    })

    // add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("setting volume to ", e.target.value)
        currentSong.volume = parseInt(e.target.value) / 100
    })


    // add and event for mute
    document.querySelector(".volume>img").addEventListener('click', (e)=>{
        const volumeBar = document.querySelector(".range").getElementsByTagName("input")[0]
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0 ;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
            volumeBar.disabled = true
        }
        else{
            e.target.src = e.target.src.replace("mute.svg" ,"volume.svg")
            currentSong.volume = .10 ;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
            volumeBar.disabled = false;


        }
    })


}

main()
