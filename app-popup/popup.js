var db_key = "itemdbkey"
var video_title = document.getElementById("v_title")
var video_length = document.getElementById("v_length")
var video_date = document.getElementById("v_date")
var video_stamp = document.getElementById("v_stamp")
var video_image = document.getElementById("v_image")
var tab2 = document.getElementById("tab2")
var note_input = document.getElementById("note-input")

var tab1 = document.getElementsByClassName("tab1-content")[0]
var loading = document.getElementsByClassName("loading-data")[0]
var loading_error = document.getElementsByClassName("loading-error")[0]
var tab2_content = document.getElementsByClassName("tab2-content")[0]


//buttons
var getData_btn = document.getElementById("getdatabtn")
var save_btn = document.getElementById("savebtn")

String.prototype.toHHMMSS = function () {
    var sec_num = parseInt(this, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);
    var unit = ""

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}

    if(seconds !== "00") unit = "sec"
    if(minutes !== "00") unit = "min"
    if(hours !== "00") unit = "hr"

    return `${hours}:${minutes}:${seconds} ${unit}`;
}

function getTodayDate() {
    var today = new Date();
    var year = today.getFullYear();
    var month = today.getMonth()+1;
    var date = today.getDate();
    return `${date}-${month}-${year}`
}

function formatTitle(title, val) {
    if(title.length > val) {
        return title.substring(0, val)+'...'
    }
    return title
}

function formatVideoLength(length) {
    let len = length.split(":").length
    if(len === 3) return `${length} hr`
    if(len === 2 && length.split(":")[0] != "0") return `${length} min`
    if(len === 2 && length.split(":")[0] == "0") return `${length} sec`
}

function getUserNote() {
    if(note_input.value !== ""){
        return note_input.value
    }
    return "---"
}

getData_btn.addEventListener("click", ()=>{
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {getVideoData: true}, function (response) {
            if(response){
                video_title.innerText = formatTitle(response.title, 47)
                video_length.innerText = formatVideoLength(response.length)
                video_date.innerText = getTodayDate()
                video_stamp.innerText = parseInt(response.stamp).toString().toHHMMSS()
                video_image.src = `https://i1.ytimg.com/vi/${response.id}/mqdefault.jpg`
                loading_error.display = "none"
                loading.style.display = "none"
                tab1.style.display = "block"
            }
            else {
                loading_error.innerText = "!!! Try Again !!!"
                loading_error.style.display = "block"
                getData_btn.innerText = "Reload"
            }
        });
    })
});

function createItemView(id, title, length, note, stamp, date) {
    let item =  `<div class="item">
    <span id="v_id-variable">${id}</span>
    <span id="v_stamp-variable">${stamp}</span>
    <span id="v_note-variable">${note}</span>
    <div class="item-img">
        <img src="https://i1.ytimg.com/vi/${id}/mqdefault.jpg"/>
    </div>
    <div class="item-info">
        <div class="video-title">
            <span class="custom-title">Title:</span>
            <span class="custom-data">${formatTitle(title, 20)}</span>
        </div>
        <div class="video-note">
            <span class="custom-title">Note:</span>
            <span class="custom-data">${note}</span>
        </div>
        <div class="video-length">
            <span class="custom-title">Total Length:</span>
            <span class="custom-data">${length}</span>
        </div>
        <div class="video-length">
            <span class="custom-title">Time Stamp:</span>
            <span class="custom-data">${stamp.toString().toHHMMSS()}</span>
        </div>
        <div class="video-length">
            <span class="custom-title">Date:</span>
            <span class="custom-data">${date}</span>
        </div>
    </div>
    <div class="item-action-group">
        <div class="item-action">
            <button class="item-action-watch" id="watchbtn">Watch</button>
            <button class="item-action-delete" id="deletebtn">Delete</button>
        </div>
    </div>
</div>`
return item
}

function delay(n){
    return new Promise(function(resolve){
        setTimeout(resolve,n*10);
    });
}

async function createPayload() {
    let payload = {}
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {getVideoData: true}, function (response) {
            if(response){
                payload = {
                    id : response.id,
                    title : response.title,
                    length : formatVideoLength(response.length),
                    date : getTodayDate(),
                    stamp : parseInt(response.stamp),
                    note : getUserNote()
                }
            }
        });
    })
    await delay(1)
    return payload
}

function saveVideoItems(obj){
    var dataInString = JSON.stringify(obj);
    localStorage.setItem(db_key, dataInString);
    return true
}

function watchVideo(id, stamp) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {watchVideo: true, v_data: [id, stamp]});
    })
}

function deleteVideo(id, stamp, note) {
    var itemsStorage = localStorage.getItem(db_key);
    var itemsArr = JSON.parse(itemsStorage);

    itemsArr.forEach(ele => {
        if(ele.id === id && ele.stamp == stamp && ele.note === note){
            itemsArr.splice(itemsArr.indexOf(ele), 1);
            saveVideoItems(itemsArr);
        }
    });
    
    tab2_content.childNodes.forEach(ele => {
        let v_id = ele.querySelector("#v_id-variable").innerText
        let v_stamp = ele.querySelector("#v_stamp-variable").innerText
        let v_note = ele.querySelector("#v_note-variable").innerText
        if(v_id === id && v_stamp == stamp && v_note === note) {
            ele.remove()
        }
    })
}

function fetchItemsFromDb() {
    var newItemHTML = '';
    try {
        var itemsStorage = localStorage.getItem(db_key);
        var itemsArr = JSON.parse(itemsStorage);
        itemsArr.reverse().forEach(item => {
            newItemHTML += createItemView(
                item.id,
                item.title,
                item.length,
                item.note,
                item.stamp,
                item.date
            )
        });
        tab2_content.innerHTML = newItemHTML

        tab2_content.childNodes.forEach(ele => {
            let v_id = ele.querySelector("#v_id-variable").innerText
            let v_stamp = ele.querySelector("#v_stamp-variable").innerText
            let v_note = ele.querySelector("#v_note-variable").innerText
            ele.querySelector("#watchbtn").addEventListener('click',()=>{
                watchVideo(v_id, v_stamp)
            })
            ele.querySelector("#deletebtn").addEventListener('click',()=>{
                deleteVideo(v_id, v_stamp, v_note)
                console.log(`delete :: ${v_id}`)
            })

        })
        return true
    }
    catch(e) {
        console.log(`[ERROR]: ${e}`)
        return false
    }
}
  
save_btn.addEventListener("click", async ()=>{
    try {
        var itemsStorage = localStorage.getItem(db_key);
        if(itemsStorage === null) {
            var itemsArr = new Array();
            createPayload().then((result)=>{
                console.log(`result: ${result}`) 
                itemsArr.push(result)}, 
                (err)=>console.log(`[ERROR]: ${err}`))
            await delay(1)
            saveVideoItems(itemsArr)
        }
        else {
            var itemsArr = JSON.parse(itemsStorage);
            createPayload().then((result)=>{
                console.log(`result: ${result}`) 
                itemsArr.push(result)},
                 (err)=>console.log(`[ERROR]: ${err}`))
            await delay(1)
            saveVideoItems(itemsArr)
        }
        getData_btn.innerText = "Get"
        loading.style.display = "flex"
        tab1.style.display = "none"
        loading_error.innerText = "!!! Saved Successfully !!! "
        loading_error.style.display = "block"
    }
    catch (e) {
        console.log(`[ERROR]: ${e}`)
    }
});




tab2.onclick = ()=>{fetchItemsFromDb()}

