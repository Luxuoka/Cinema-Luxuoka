import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import MoviesView from '../views/MoviesView.vue'
import SeriesView from '../views/SeriesView.vue'
import AnimeView from '../views/AnimeView.vue'
import WatchView from '../views/WatchView.vue'
import WatchlistView from '../views/WatchlistView.vue'
import ProfileView from '../views/ProfileView.vue'
import GenreView from '../views/GenreView.vue'
import TrendingView from '../views/TrendingView.vue'

const routes = [
    {
        path: '/',
        name: 'home',
        component: HomeView
    },
    {
        path: '/trending',
        name: 'trending',
        component: TrendingView
    },

    {
        path: '/movies',
        name: 'movies',
        component: MoviesView
    },
    {
        path: '/series',
        name: 'series',
        component: SeriesView
    },
    {
        path: '/anime',
        name: 'anime',
        component: AnimeView
    },
    {
        path: '/drama',
        name: 'drama',
        component: () => import('../views/DramaView.vue')
    },
    {
        path: '/kids',
        name: 'kids',
        component: () => import('../views/KidsView.vue')
    },
    {
        path: '/sports',
        name: 'sports',
        component: () => import('../views/SportsView.vue')
    },
    {
        path: '/news',
        name: 'news',
        component: () => import('../views/NewsView.vue')
    },
    {
        path: '/entertainment',
        name: 'entertainment',
        component: () => import('../views/EntertainmentView.vue')
    },
    {
        path: '/streaming/:serviceId',
        name: 'streaming',
        component: () => import('../views/StreamingView.vue')
    },

    {
        path: '/genres',
        name: 'genres',
        component: GenreView
    },
    {
        path: '/watchlist',
        name: 'watchlist',
        component: WatchlistView
    },
    {
        path: '/profile',
        name: 'profile',
        component: ProfileView
    },
    {
        path: '/watch/:type/:id',
        name: 'watch',
        component: WatchView,
        props: true
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'not-found',
        component: () => import('../views/NotFoundView.vue')
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
