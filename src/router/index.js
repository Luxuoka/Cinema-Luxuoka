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
import ProfileView from '../views/ProfileView.vue'
import HistoryView from '../views/HistoryView.vue'
import ProfileSelectionView from '../views/ProfileSelectionView.vue'
import AdminView from '../views/AdminView.vue'
import LoginRequiredView from '../views/LoginRequiredView.vue'
import AboutView from '../views/AboutView.vue'
import PrivacyView from '../views/PrivacyView.vue'
import TermsView from '../views/TermsView.vue'
import FAQView from '../views/FAQView.vue'
import ContactView from '../views/ContactView.vue'
import RequestView from '../views/RequestView.vue'
import { userState } from '../stores/userStore'

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
        component: SeriesView,
        meta: { requiresAuth: true }
    },
    {
        path: '/genres',
        name: 'genres',
        component: GenreView
    },
    {
        path: '/watchlist',
        name: 'watchlist',
        component: WatchlistView,
        meta: { requiresAuth: true }
    },
    {
        path: '/watch/:type/:id',
        name: 'watch',
        component: WatchView,
        props: true
    },
    {
        path: '/admin',
        name: 'admin',
        component: AdminView,
        meta: { requiresAuth: true }
    },
    {
        path: '/anime',
        name: 'anime',
        component: AnimeView,
        meta: { requiresAuth: true }
    },
    {
        path: '/watch/anime/:id',
        name: 'watch-anime',
        component: AnimeDetailView,
        props: true
    },
    {
        path: '/profile',
        name: 'profile',
        component: ProfileView,
        meta: { requiresAuth: true }
    },
    {
        path: '/history',
        name: 'history',
        component: HistoryView,
        meta: { requiresAuth: true }
    },
    {
        path: '/profiles',
        name: 'profiles',
        component: ProfileSelectionView,
        meta: { requiresAuth: true }
    },
    {
        path: '/login-required',
        name: 'login-required',
        component: LoginRequiredView
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
    routes
})

router.beforeEach(async (to, from, next) => {
    // Wait for auth state to be resolved
    if (userState.loading) {
        // Simple polling to wait for loading to finish
        await new Promise(resolve => {
            const stop = setInterval(() => {
                if (!userState.loading) {
                    clearInterval(stop);
                    resolve();
                }
            }, 50);
        });
    }

    if (to.meta.requiresAuth && !userState.isLoggedIn) {
        next({ name: 'login-required', query: { redirect: to.fullPath } })
    } else {
        next()
    }
})

export default router
