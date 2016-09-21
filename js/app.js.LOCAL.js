'use strict';

import Sammy from 'sammy';
import {appUrls} from 'app-urls';
import {pageController} from 'page-controller';
import {userController} from 'user-controller';
import {headers} from 'headers';
import {recipeController} from 'recipe-controller';
import {notificator} from 'notificator';
import {messages} from 'messages';
import {pageView} from 'page-view';

let MAIN_CONTENT_SELECTOR = '#content',
    MAIN_NAVIGATION_SELECTOR = '#main-navigation';

function loadHeader(context) {
    if (localStorage.authKey) {
        pageController.loadMainNavigationWhenUserIsLoggedIn(context, MAIN_NAVIGATION_SELECTOR, {});
    } else {
        pageController.loadMainNavigationWhenNoUserIsLoggedIn(context, MAIN_NAVIGATION_SELECTOR, {});
    }
}

let router = new Sammy(function () {
    this.get(appUrls.BASE_URL, function (context) {
        loadHeader(context);
        pageController.loadHomePage(context, MAIN_CONTENT_SELECTOR);
    });

    this.get(appUrls.LOGIN_URL, function (context) {
        pageController.loadLoginPage(context, MAIN_CONTENT_SELECTOR);
    });

    this.get(appUrls.REGISTER_URL, function (context) {
        pageController.loadRegisterPage(context, MAIN_CONTENT_SELECTOR);
    });

    this.get(appUrls.FOUND_USERS_URL, function (context) {
        pageController.loadFoundUsersPage(MAIN_CONTENT_SELECTOR, app.foundUsers);
    });

    this.get(appUrls.PROFILE_URL, function (content) {
        userController
            .getUserData()
            .then(response => {
                pageController.loadProfilePage(MAIN_CONTENT_SELECTOR, response);
            });
    });

    // Events
    this.bind('redirectToUrl', function (event, url) {
        this.redirect(url);
    });

    this.bind('registerUser', function (event, data) {
        userController.registerUser(data);
    });

    this.bind('loginUser', function (event, data) {
        userController.loginUser(data);
    });

    this.bind('logoutUser', function (event, data) {
        userController.logoutUser();
    });

    this.bind('searchUsers', function (event, data) {
        userController.getFoundUser(MAIN_CONTENT_SELECTOR, data);
    });

    this.bind('addRecipeToFavorites', function (event, data) {
        recipeController.getRecipeById(data)
            .then(response => {
                return userController.addRecipeToFavorites(response);
            })
            .then(response => {
                notificator.showNotification(messages.RECIPE_ADDED_TO_FAVORITES, 'success');
            });
    });

    this.bind('addRecipeToLikes', function (event, data) {
        recipeController.getRecipeById(data)
            .then(response => {
                return userController.addRecipeToLikes(response)
            })
            .then(response => {
                notificator.showNotification(messages.RECIPE_ADDED_TO_LIKES, 'success');
            });
    })

    this.bind('showFavoriteRecipes', function (event) {
        userController.getUserFavoriteRecipes()
            .then(response => {
                let recipes = response.favoriteRecipes,
                    favoriteRecipesSelector = '#favorite-recipes-container';

                pageController.loadFavoriteRecipes(favoriteRecipesSelector, recipes);
            });
    });

    this.bind('showLikedRecipes', function (event) {

    });

    this.bind('loadMoreRecipes', function (event) {
        recipeController
            .getRandomRecipes()
            .then(response => {
                pageController
                    .addNewRecipes(MAIN_CONTENT_SELECTOR, response)
                    .then(success => {
                        pageView.hideMiniLoader();
                    });
            });
    });
});

router.run(appUrls.BASE_URL);
let app = {};
export {app};