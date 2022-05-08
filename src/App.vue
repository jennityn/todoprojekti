<template>
  <div id="upper">
    <h1 id="header">TO-DO</h1>
    <div id="date">Date: {{ currentDate() }}</div>
  </div>

  <div class="navBar">
    <button class="showDivs" @click="showDivAdd()">TODAY</button>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    <button class="showDivs" @click="showDivAll()">HISTORY</button>
  </div>

  <div class="divs" id="addDiv">
    <form @submit.prevent="addNewTodo">

      <label id="today">TODAY'S TASKS</label>
      <div id="currentDate">{{ currentDate() }}</div>
      <input type="text" id="addNew" v-model="newToDo" placeholder="Add a new task"
             name="newTodo"
             :maxlength="max">
      <button id="addBtn">+</button>
      <div class="totalChar" v-text="(max - newToDo.length)"></div>

    </form>

    <ul class="todoList" id="todoList">
      <li v-for="(todo, index) in todos" :key="todo.id" class="todo">
        <div :class="{ done: todo.done }" @click="toggleDone(todo)">
          {{ todo.description }}
        </div>
        <button class="removeItem" @click="removeToDo(index)">X</button>
      </li>
    </ul>
    <div id="saveMsg">Save successful!
      <button @click="hideSaveMsg()" id="saveOk">Nice!</button>
    </div>

    <button class="massButtons" @click="markAllDone">All Done</button>
    &nbsp;&nbsp;&nbsp;
    <button class="massButtons" @click="removeAll">Remove All</button>
    &nbsp;&nbsp;&nbsp;
    <button class="massButtons" @click="saveAll()">Save & Clear</button>
  </div>


  <div class="divs" id="allDiv">
    <div id="search">
      <label class="labels" for="startingDate">From:</label>
      <input class="selectDate" type="week" id="startingDate" name="startingDate">
      <label class="labels" for="endingDate">To:</label>
      <input class="selectDate" type="week" id="endingDate" name="endingDate">
      <input @click="makeQuery()" type="button" value="Search" id="submit">
      <div id="divElement">

      </div>
      <input @click="clearPage()" type="button" value="Ok" id="ok">
    </div>
  </div>


</template>
<script>

/**
 * Käytössä Vue Composition API
 */

let json;

import {ref} from 'vue';

export default {

  name: 'App',
  components: {},


  setup() {
    let max = 200;
    const newToDo = ref('');
    const todos = ref([]);
    const allTodos = ref([]);
    let todoValue = 0;

    /** @function hideSaveMsg
     * piilottaa tallennuksen onnistumisviestin
     */
    function hideSaveMsg(){
      document.getElementById("saveMsg").style.display = 'none';
      document.getElementById("saveOk").style.display = 'none';
    }

    /** @function showDivAdd
     * asettaa tehtävälistan näkyviin ja piilottaa viikkohistorian
     */
    function showDivAdd() {
      let add = document.getElementById('addDiv');
      let all = document.getElementById('allDiv');
      add.style.display = 'block';
      all.style.display = 'none';
    }

    /** @function showDivAll
     * asettaa viikkohistorian näkyviin ja piilottaa tehtävälistan
     */
    function showDivAll() {
      let add = document.getElementById('addDiv');
      let all = document.getElementById('allDiv');
      all.style.display = 'block';
      add.style.display = 'none';
    }

    /** @function currentDate
     * luo merkkijonoesityksen päivämäärälle
     * @returns {string} päivämäärä
     */
    function currentDate() {
      const current = new Date();
      const date = current.getDate() + '-' + (current.getMonth() + 1) + '-' + current.getFullYear();
      return date;
    }

    /** @function currentWeek
     * luo merkkijonoesityksen viikkonumerolle
     * @returns {string} viikkonumero
     */
    function currentWeek() {
      let currentDate = new Date();
      let startDate = new Date(currentDate.getFullYear(), 0, 1);
      let days = Math.floor((currentDate - startDate) /
          (24 * 60 * 60 * 1000));

      let weekNumber = Math.ceil(
          (currentDate.getDay() + days) / 7);

      let stringWeek = currentDate.getFullYear() +  '-W' + weekNumber;
      return stringWeek;
    }

    /** @function addNewTodo
     * lisää uuden tehtävän tehtävälistaan
     */
    function addNewTodo() {
      if (this.newToDo.trim().length == 0) {
        return;
      }
      todos.value.push({
        id: Date.now(),
        week: currentWeek(),
        done: false,
        description: newToDo.value,
      });
      console.log(todos.value);
      newToDo.value = '';
      todoValue++;
      console.log('Current task count in list: ' + todoValue);
    }

    /** @functiontoggleDone
     * vaihtaa tehtävän tilan tehdyksi tai tekemättömäksi
     * @param todo muutettava tehtävä
     */
    function toggleDone(todo) {
      todo.done = !todo.done;
    }

    /** @function removeTodo
     * poistaa tehtävän tehtävälistalta
     * @param index tehtävän indeksinumero
     */
    function removeToDo(index) {
      todos.value.splice(index, 1);
      todoValue--;
    }

    /** @functionmarkAllDone
     * vaihtaa kaikkien tehtävälistan tehtävien tilan tehdyksi
     */
    function markAllDone() {
      todos.value.forEach((todo) => todo.done = true);
    }

    /** @function removeAll
     * poistaa kaikki päivän tehtävät tehtävälistalta
     */
    function removeAll() {
      todos.value = [];
    }

    /** @function saveAll
     * tallentaa kaikki päivän tehtävät ja tehtävien tiedot tietokantaan
     */
    function saveAll() {
      let xhr = [];
      for (let i = 0; i < todoValue; i++){
        let id = todos.value[i].id;
        (function(i) {
          xhr[i] = new XMLHttpRequest();
          xhr[i].open('POST', `http://localhost:8081/api/add/${id}`, true);
          xhr[i].setRequestHeader('Content-type', 'application/json');
          xhr[i].onreadystatechange = function() {
            if (xhr[i].readyState == 4 && xhr[i].status == 200) {
              console.log('pääsee funktioon');
            }
          };
          xhr[i].send(JSON.stringify(JSON.parse(JSON.stringify(todos.value[i]))));
        })(i);
      }
      document.getElementById("saveMsg").style.display = 'flex';
      document.getElementById("saveOk").style.display = 'inline-block';
      todos.value = [];
    }

    /** @function clearPage
     * tyhjää sivun
     */
    function clearPage() {
      document.getElementById("divElement").innerHTML ="";
      document.getElementById("ok").style.display = 'none';
      document.getElementById("submit").style.display = 'inline-block';
    }

    /** @function makeQuery
     * tekee tietokantakyselyn halutuille viikkonumeroille ja palauttaa haetut tiedot JSON-sanomana
     */
    function makeQuery() {
      let startdate = document.getElementById('startingDate').value;
      let enddate = document.getElementById('endingDate').value;
      if (startdate.length == 0) {
        alert("Please choose valid dates");
        return;
      } else {
        let xrh = new XMLHttpRequest();
        xrh.onreadystatechange = function() {
          if (xrh.readyState == 4 && xrh.status == 200) {
            json = JSON.parse(xrh.responseText);
            console.log(json);

            if (json.numOfRows > 0) { // something found
              showList(json);
            } else {
              document.getElementById('divElement').innerHTML = '<br/>No tasks found within this period.';
            }
          }
        };
        xrh.open('GET', 'http://localhost:8081/api/todos?start=' + startdate + '&end=' + enddate, true);
        console.log("start: " + startdate + ", end: " + enddate);
        xrh.setRequestHeader('Content-type', 'application/json');
        xrh.send();
      }
    }

    /** @function showList
     * luo palautetun JSON-sanoman mukaisen listan tietokannasta saatujen tietojen perusteella ja luo listan osille HTML-elementit,
     *  sekä luo ja asettelee elementit sivustolle
     * @param json tietokannasta palautettu JSON-lista
     */
    function showList(json) {
      let divElement = document.getElementById('divElement');
      let i;
      let unOrdered;
      let listElement, nestedElement;
      let string;
      let done;


      for (i in json.rows) {
        unOrdered = document.createElement('ul');
        unOrdered.setAttribute('class', 'jsonList');
        unOrdered.setAttribute('id', 'jsonList');
        divElement.appendChild(unOrdered);

        listElement = document.createElement('li');
        listElement.setAttribute('class', 'jsonListTasks');
        if (json.rows[i].done == 1){
          done = "DONE"
        }
        else {
          done = "NOT DONE"
        }
        string = json.rows[i].description
            + ", " + done;
        listElement.innerHTML = string;
        unOrdered.appendChild(listElement);

        nestedElement = document.createElement('ul');
        nestedElement.setAttribute('class', 'jsonListWeeks');
        string = json.rows[i].week;
        nestedElement.innerHTML = string;
        listElement.appendChild(nestedElement);
      }
      document.getElementById("ok").style.display = 'inline-block';
      document.getElementById("submit").style.display = 'none';

    }


    return {
      todoValue,
      todos,
      newToDo,
      allTodos,
      max,
      hideSaveMsg,
      addNewTodo,
      toggleDone,
      currentWeek,
      removeToDo,
      saveAll,
      markAllDone,
      removeAll,
      currentDate,
      makeQuery,
      showDivAll,
      showDivAdd,
      clearPage,
    };
  },

  mounted() {
    let add = document.getElementById('addDiv');
    let all = document.getElementById('allDiv');
    add.style.display = 'block';
    all.style.display = 'none';
  },
}
;

</script>
<style>
@import "app.css";
</style>


