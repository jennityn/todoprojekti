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

    <ul>
      <li v-for="(todo, index) in todos" :key="todo.id" class="todo">
        <div :class="{ done: todo.done }" @click="toggleDone(todo)">
          {{ todo.description }}
        </div>
        <button class="removeItem" @click="removeToDo(index)">X</button>
      </li>
    </ul>

    <button class="massButtons" @click="markAllDone">All Done</button>
    &nbsp;&nbsp;&nbsp;
    <button class="massButtons" @click="removeAll">Remove All</button>
    &nbsp;&nbsp;&nbsp;
    <button class="massButtons" @click="saveAll">Save</button>
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
    </div>
  </div>


</template>
<script>

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

    function showDivAdd() {
      let add = document.getElementById('addDiv');
      let all = document.getElementById('allDiv');
      add.style.display = 'block';
      all.style.display = 'none';
    }

    function showDivAll() {
      let add = document.getElementById('addDiv');
      let all = document.getElementById('allDiv');
      all.style.display = 'block';
      add.style.display = 'none';
    }

    function currentDate() {
      const current = new Date();
      const date = current.getDate() + '-' + (current.getMonth() + 1) + '-' + current.getFullYear();
      return date;
    }

    function currentWeek() {
      let currentDate = new Date();
      let startDate = new Date(currentDate.getFullYear(), 0, 1);
      let days = Math.floor((currentDate - startDate) /
          (24 * 60 * 60 * 1000));

      let weekNumber = Math.ceil(
          (currentDate.getDay() + 1 + days) / 7);

      let stringWeek = "W"+weekNumber+"-"+currentDate.getFullYear();
      return stringWeek;
    }

    function addNewTodo() {
      if (this.newToDo.trim().length == 0) {
        return;
      }
      todos.value.push({
        id: Date.now(), //!!!HUOM!!!! tähän databaseen menevä id-muoto
        week: currentWeek(),
        done: false,
        description: newToDo.value,
      });
      console.log(todos.value);
      newToDo.value = '';
      todoValue++;
    }

    function toggleDone(todo) {
      todo.done = !todo.done;
    }

    function removeToDo(index) {
      todos.value.splice(index, 1);
    }

    function markAllDone() {
      todos.value.forEach((todo) => todo.done = true);
    }

    function removeAll() {
      todos.value = [];
    }

    function saveAll() {
      let xmlhttp = new XMLHttpRequest();
      xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
          json = JSON.parse(xmlhttp.responseText);
            for (let i = 0; i < todos.value.length; i++) {
              xmlhttp.open('POST', 'http://localhost:8081/api/add$%7Bid%7D', true);
              xmlhttp.send();
              i++;
            }
          }
        }
    }

    function makeQuery() {
      let startdate = document.getElementById('startingDate').value;
      let enddate = document.getElementById('endingDate').value;
      if (startdate.length == 0) { // MUOKKAA TÄMÄ
        return;
      } else {
        let xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
          if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            json = JSON.parse(xmlhttp.responseText);
            console.log(json);

            if (json.numOfRows > 0) { // something found
              showList(json);
            } else {
              document.getElementById('divElement').innerHTML = '<br/>No tasks found within this period.';
            }
          }
        };
        xmlhttp.open('GET', 'http://localhost:8081/api/todos?start=' + startdate + '&end=' + enddate, true);
        xmlhttp.send();
      }
    }

    function showList(json) {
      let divElement = document.getElementById('divElement');
      let i;
      let unOrdered;
      let listElement, nestedElement;
      let string;
      for (i in json.rows) {
        unOrdered = document.createElement('ul');
        unOrdered.setAttribute('class', 'jsonList');
        divElement.appendChild(unOrdered);

        listElement = document.createElement('li');
        unOrdered.setAttribute('class', 'jsonListWeeks');
        string = json.rows[i].week;
        listElement.innerHTML = string;
        unOrdered.appendChild(listElement);

        nestedElement = document.createElement('ul');
        unOrdered.setAttribute('class', 'jsonListTasks');
        string = json.rows[i].description
            + ', ' + json.rows[i].done;
        nestedElement.innerHTML = string;
        listElement.appendChild(nestedElement);

        //unNestedElement = document.createElement('ul');

        //nestedElement.appendChild(unNestedElement);
      }
    }

    return {
      todoValue,
      todos,
      newToDo,
      allTodos,
      max,
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
    };
  },
  mounted() {
    let add = document.getElementById('addDiv');
    let all = document.getElementById('allDiv');
    add.style.display = 'block';
    all.style.display = 'none';
  },
};

</script>
<style>
@import "app.css";
</style>
