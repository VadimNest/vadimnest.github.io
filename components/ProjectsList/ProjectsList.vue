<script setup lang="ts">
const projects = [
  {
    name: '01 - Геометрические фигуры, дверь',
    component: 'figures',
  },
  {
    name: '02 - Галактика',
    component: 'galaxy',
  },
  {
    name: '03 - Океан',
    component: 'ocean',
  },
  {
    name: '04 - Остров',
    component: 'island',
  },
  {
    name: '05 - Взрыв частиц',
    component: 'explosion-particles',
  },
  {
    name: '06 - Полет через космос',
    component: 'space-fly',
  },
  {
    name: '07 - Модель дракона из частиц',
    component: 'particles-model',
  },
  {
    name: '08 - Модель tesla',
    component: 'tesla',
  },
  {
    name: '09 - Процедурно сгенерированное солнце',
    component: 'sun',
  },
];
</script>

<template>
  <div class="projects">
    <div class="projects__container">
      <h2 class="projects__title">Projects:</h2>
      <ul>
        <li v-for="project in projects" :key="project.name" class="projects__link">
          <NuxtLink :to="project.component">{{ project.name }}</NuxtLink>
        </li>
      </ul>
    </div>
  </div>
</template>

<style src="./ProjectsList.less" lang="less" />
