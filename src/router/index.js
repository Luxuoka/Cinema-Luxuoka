import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import MoviesView from '../views/MoviesView.vue'
import SeriesView from '../views/SeriesView.vue'
import WatchView from '../views/WatchView.vue'
import WatchlistView from '../views/WatchlistView.vue'
import GenreView from '../views/GenreView.vue'
import TrendingView from '../views/TrendingView.vue'
import AnimeView from '../views/AnimeView.vue'
import AnimeDetailView from '../views/AnimeDetailView.vue'

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
    // Extra categories removed for a cleaner, more focused experience

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
        path: '/watch/:type/:id',
        name: 'watch',
        component: WatchView,
        props: true
    },
    {
        path: '/anime',
        name: 'anime',
        component: AnimeView
    },
    {
        path: '/watch/anime/:id',
        name: 'watch-anime',
        component: AnimeDetailView,
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
