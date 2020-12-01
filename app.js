const validDaysLookup = {
    January: 31,
    February: 29,
    March: 31,
    April: 30,
    May: 31,
    June: 30,
    July: 31,
    August: 31,
    September: 30,
    October: 31,
    November: 30,
    December: 31
}

const toDoInput = document.querySelector(".todo-input");
const toDoBtn = document.querySelector(".todo-button");
const toDoList = document.querySelector(".todo-list");
const filterOptions = document.querySelector("#filter-options");
const dayOptions = document.querySelector("#day-selection")
const yearOptions = document.querySelector("#year-selection")
const monthOptions = document.querySelector("#month-selection")
let currentID = 1;


document.addEventListener("DOMContentLoaded", loadLocal)
toDoBtn.addEventListener("click", addTodo);
filterOptions.addEventListener("click", filterList);

//populate the option fields

for (i = 1; i <= 31; i++) {
    const newDay = document.createElement("option");
    newDay.value = `${i}`
    newDay.innerText = `${i}`
    dayOptions.appendChild(newDay);
}

for (i = 2020; i <= 2030; i++) {
    const newYear = document.createElement("option");
    newYear.value = `${i}`
    newYear.innerText = `${i}`
    yearOptions.appendChild(newYear);
}


function addTodo(evt) {

    evt.preventDefault();

    //dont accept empty inputs
    if (toDoInput.value == "") {
        //fancy animation
        toDoInput.placeholder = "Add something here"
        toDoInput.parentNode.style.animation = "bounce 0.3s ease-in-out forwards";
        setTimeout(function () { toDoInput.parentNode.style.animation = ""; }, 300);
        return;
    }

    const year = yearOptions.value
    const month = monthOptions.value
    const day = dayOptions.value

    //invalid dates
    if (day > validDaysLookup[month]) {
        console.log("this month doesnt have that many days")
        dayOptions.style.animation = "bounce 0.3s ease-in-out forwards";
        setTimeout(function () { dayOptions.style.animation = ""; }, 300);
        return;
    }
    else if (month == "February" && day == 29 && year % 4 != 0) {
        console.log("this february isnt leap :/")
        dayOptions.style.animation = "bounce 0.3s ease-in-out forwards";
        yearOptions.style.animation = "bounce 0.3s ease-in-out forwards";
        setTimeout(function () {
            dayOptions.style.animation = "";
            yearOptions.style.animation = ""
        }, 300);
        return;
    }

    let date = day + " " + month + " " + year;
    let nextID = localStorage.nextID++;
    createListItem(nextID, toDoInput.value, date, false);
    //save value
    saveLocal(nextID, toDoInput.value, date, false);
    //reset input
    toDoInput.value = "";



}
/*
.listdiv #id-## < .listItem <span span> >
                < .buttonWrp <chekBtn trashBtn >

*/
function createListItem(id, content, date, completed) {

    const listDiv = document.createElement("div");
    listDiv.classList.add("list-item-wrapper")
    listDiv.id = `item-${id}`


    const listItem = document.createElement("li");
    listItem.classList.add("list-item")

    //the content of the list item
    listItem.innerHTML = `<span>${content}</span><span>Deadline:  ${date}</span>`;

    toDoList.appendChild(listDiv);
    listDiv.appendChild(listItem);


    //div that wraps the buttons
    const buttonsWrp = document.createElement("div")
    buttonsWrp.classList.add("btn-wrapper")
    listDiv.appendChild(buttonsWrp);


    //creating the completed button
    const chkBtn = document.createElement("button");
    chkBtn.innerHTML = `<i class="fas fa-check"></i>`
    chkBtn.addEventListener("click", completedListItem);
    buttonsWrp.appendChild(chkBtn);


    //creating the delete button
    const trashBtn = document.createElement("button");
    trashBtn.innerHTML = `<i class="fas fa-trash"></i>`
    buttonsWrp.appendChild(trashBtn);
    trashBtn.addEventListener("click", removeTodo);
    trashBtn.addEventListener("mouseover", hoverTrash);
    trashBtn.addEventListener("mouseout", hoverTrashLeav);

    //manually trigger an event as if checked was clicked
    if (completed) {
        // let evt = new Event("click");
        // chkBtn.dispatchEvent(evt);
        listDiv.classList.toggle("done");
        chkBtn.classList.toggle("done");
        trashBtn.classList.toggle("disabled");
    }
}

//FUNCTIONS FOR THE CHECK AND TRASH BUTTONS
function completedListItem() {

    this.parentNode.parentNode.classList.toggle("done");
    this.classList.toggle("done");
    this.parentNode.querySelector("button:last-child").classList.toggle("disabled");
    //update the local storage
    toggleComplete(this.parentNode.parentNode.id)

}

function removeTodo(e) {
    this.parentNode.parentNode.style.animation = "goOut 0.4s ease-in-out forwards"
    //get listing to delete from local storage
    let toDelete = this.parentNode.parentNode.id
    //delete from local memory
    deleteLocal(toDelete);
    this.parentNode.parentNode.addEventListener("animationend", function () { this.remove() })
}

function hoverTrash() {
    this.parentNode.parentNode.classList.add("delete")

}

function hoverTrashLeav() {
    this.parentNode.parentNode.classList.remove("delete")

}


//FILTERING THE LIST WITHT HE DROPDOWN
function filterList(evt) {
    console.log(evt.target.value);
    // if (evt.target === filterOptions) return;
    const todos = toDoList.childNodes;
    console.log("LIST ITEM= ", todos)
    todos.forEach(item => {
        console.log("here2")
        switch (evt.target.value) {
            case "all":
                item.style.display = "flex"
                break;
            case "done":
                if (item.classList.contains("done")) {
                    item.style.display = "flex"
                }
                else {
                    item.style.display = "none"
                }
                break;
            case "not-done":
                if (!item.classList.contains("done")) {
                    item.style.display = "flex"
                }
                else {
                    item.style.display = "none"
                }
                break;

        }
    })
}

//saves list items locally
//the items are stored in an object like this
/*
{
    "id-##": {content, date, completed}
}
*/

function saveLocal(id, todo, date, completed) {

    let todosTemp

    //we get todos from storage, add the new list item and store them again
    if (localStorage.getItem("todos") == null) {
        todosTemp = {};
    }
    else {
        todosTemp = JSON.parse(localStorage.getItem("todos"))
    }
    todosTemp[id] = { "content": todo, "date": date, "completed": completed };
    localStorage.setItem("todos", JSON.stringify(todosTemp))

}

function toggleComplete(idToUpdate) {
    console.log(idToUpdate)
    let todosTemp = JSON.parse(localStorage.getItem("todos"))
    let todoToUpdate = todosTemp[idToUpdate.slice(5)]
    console.log(todoToUpdate)
    //toggel completed value
    todoToUpdate["completed"] = !todoToUpdate["completed"];
    localStorage.setItem("todos", JSON.stringify(todosTemp))

}

//i dont use this for now
function getNextID(currentID) {
    let todosTemp = JSON.parse(localStorage.getItem("todos"))
    if (todosTemp == null) {
        return 1;
    }
    while (todosTemp.hasOwnProperty(currentID)) {
        currentID++;
    }
    return currentID;
}

//load list items on load
function loadLocal() {

    //if we have something stored load content
    //retrieve the list onjects from storage and recreate them
    if (localStorage.getItem("todos")) {
        let todosTemp = JSON.parse(localStorage.getItem("todos"));
        for (const id in todosTemp) {
            createListItem(id, todosTemp[id].content, todosTemp[id].date, todosTemp[id].completed)
        }
    }
    if (localStorage.nextID == null)
        //we should get the next available id if this is null
        localStorage.setItem("nextID", 1)


}


// delete list items
function deleteLocal(idToRemove) {
    let todosTemp = JSON.parse(localStorage.getItem("todos"));
    console.log("deleting", idToRemove)
    //the is is like item-##
    //so we slice from 5 to get the key
    delete todosTemp[idToRemove.slice(5)]
    localStorage.setItem("todos", JSON.stringify(todosTemp))
}