<template>
  <h1>Vue todo app</h1>
  <div class="navBar">
    <button class="showDivs" @click="showDivAdd()">addaussivu</button>
    &nbsp;&nbsp;&nbsp;
    <button class="showDivs" @click="showDivAll()">kaikki tähän</button>
  </div>


  <div id="addDiv">
    <form @submit.prevent="addNewTodo">
      <div id="currentDate">Date: {{ currentDate() }}</div>
      <label>TO-DO</label>
      <input v-model="newToDo" type="text" placeholder="Add a new task" name="newTodo" maxlength="200">
      <button>Add new todo</button>
    </form>

    <ul>
      <li v-for="(todo, index) in todos" :key="todo.id" class="todo">
        <div :class="{ done: todo.done }" @click="toggleDone(todo)">
          {{ todo.content }}
        </div>
        <button class="removeItem" @click="removeToDo(index)">x</button>
      </li>
    </ul>

    <button @click="markAllDone">Mark All Done</button>
    &nbsp;&nbsp;&nbsp;
    <button @click="removeAll">Remove All</button>
  </div>

  <div id="allDiv">
    <div id="search">
      <label for="startingDate">From:</label>
      <input type="week" id="startingDate" name="startingDate">
      <label for="endingDate">To:</label>
      <input type="week" id="endingDate" name="endingDate">
      <input @click="makeQuery()" type="button" value="Lähetä" id="submit">
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
    const newToDo = ref('');
    const todos = ref([]);
    const allTodos = ref([]);

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

    function addNewTodo() {
      if (this.newToDo.trim().length == 0) {
        return;
      }
      todos.value.push({
        id: Date.now(), //!!!HUOM!!!! tähän databaseen menevä id-muoto
        done: false,
        content: newToDo.value,
      });
      newToDo.value = '';
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
              document.getElementById('locationInfo').innerHTML = '<br/>No tasks found within this period.';
            }
          }
        };
        xmlhttp.open('GET', 'http://localhost:8082/api/events?start=' + startdate + '&end=' + enddate, true);
        xmlhttp.send();
      }
    }

    function showList(json) {
      //document.getElementById("locationInfo").innerHTML = "New text!";
      let divElement = document.getElementById('divElement');

      let i;
      let unOrdered;
      let listElement, nestedElement, unNestedElement;
      let string;
      for (i in json.rows) {
        // create a form group div
        unOrdered = document.createElement('ul');
        unOrdered.setAttribute('class', 'del'); // mark all these dynamically created elements to be "deleted"
        divElement.appendChild(unOrdered);

        listElement = document.createElement('li');
        listElement.setAttribute('class', 'del');
        string = json.rows[i].Kuvaus;
        listElement.innerHTML = string;
        unOrdered.appendChild(listElement);
        nestedElement = document.createElement('ul');
        nestedElement.setAttribute('class', 'del');
        listElement.appendChild(nestedElement);
        unNestedElement = document.createElement('li');
        unNestedElement.setAttribute('class', 'del');
        string = json.rows[i].Paiva_id+ ', ' + json.rows[i].Kuvaus + ', ' + json.rows[i].Tehty;
        unNestedElement.innerHTML = string;
        nestedElement.appendChild(unNestedElement);
      }
    }

    return {
      todos,
      newToDo,
      allTodos,
      addNewTodo,
      toggleDone,
      removeToDo,
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
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.1/dist/css/bootstrap.min.css">
<style>

@import "app.css";
</style>
