# Nuxt 3 Minimal Starter

Look at the [Nuxt 3 documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install the dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm run dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm run build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm run preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.




# ThreeContainer

Vue 3 компонент-обертка для создания 3D сцен с использованием Three.js.
ThreeContainer предоставляет готовую инфраструктуру для работы с Three.js в Vue приложении, избавляя от необходимости настраивать базовые элементы Three.js вручную.

## Основные возможности

- Автоматическая инициализация Three.js сцены, камеры и рендерера
- Встроенные контролы для управления камерой (OrbitControls)
- Система анимации для создания динамических сцен
- Автоматическая адаптация под изменение размера окна
- Корректная очистка ресурсов при размонтировании

## Пример использования

<template>
  <ThreeContainer
    ref="threeContainer"
    :camera-position="[3, 2, 4]"
    custom-animation
    @scene-ready="handleSceneReady"
  />
</template>

## Конфигурация

Компонент принимает базовые настройки для кастомизации сцены:
- Позиция камеры
- Цвет фона
- Параметры камеры (FOV, near/far planes)
- Включение пользовательской анимации
- Прозрачность фона

## События

- `scene-ready`: вызывается когда сцена готова к использованию, предоставляет доступ к контексту Three.js (сцена, камера, рендерер, контролы)




# ProjectsList

Компонент для навигации по Three.js проектам.

{
  name: '02 - New Project',    // Название проекта
  component: 'Project02',      // Компонент для роутинга
}




# Project Structure
Каждый Three.js проект располагается на отдельной странице в директории pages/
