import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

// Lazy-loaded views
const MoviesView = () => import('../views/MoviesView.vue')
const SeriesView = () => import('../views/SeriesView.vue')
const WatchView = () => import('../views/WatchView.vue')
const GenreView = () => import('../views/GenreView.vue')
const TrendingView = () => import('../views/TrendingView.vue')
const AnimeView = () => import('../views/AnimeView.vue')
const AnimeDetailView = () => import('../views/AnimeDetailView.vue')
const AboutView = () => import('../views/AboutView.vue')
const PrivacyView = () => import('../views/PrivacyView.vue')
const TermsView = () => import('../views/TermsView.vue')
const FAQView = () => import('../views/FAQView.vue')
const ContactView = () => import('../views/ContactView.vue')
const RequestView = () => import('../views/RequestView.vue')
const DramaHubView = () => import('../views/DramaHubView.vue')
const DramaCountryView = () => import('../views/DramaCountryView.vue')

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
        path: '/genres',
        name: 'genres',
        component: GenreView
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
        path: '/drama',
        name: 'drama',
        component: DramaHubView
    },
    {
        path: '/drama/:country',
        name: 'drama-country',
        component: DramaCountryView,
        props: true
    },
    {
        path: '/about',
        name: 'about',
        component: AboutView
    },
    {
        path: '/privacy',
        name: 'privacy',
        component: PrivacyView
    },
    {
        path: '/terms',
        name: 'terms',
        component: TermsView
    },
    {
        path: '/faq',
        name: 'faq',
        component: FAQView
    },
    {
        path: '/contact',
        name: 'contact',
        component: ContactView
    },
    {
        path: '/request',
        name: 'request',
        component: RequestView
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'not-found',
        component: () => import('../views/NotFoundView.vue')
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition
        } else {
            return { top: 0 }
        }
    }
})

export default router
