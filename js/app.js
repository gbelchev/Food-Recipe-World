var app = app || {};

(function () {
    'use strict';

    let MAIN_CONTENT_SELECTOR = '#content',
        MAIN_NAVIGATION_SELECTOR = '#main-navigation',
        MAIN_RECIPE_SEARCH_MENU_SELECTOR = '#recipe-search';

    function loadHeader(context, data) {
        if (localStorage.authKey) {
            app.pageController.loadMainNavigationWhenUserIsLoggedIn(context, MAIN_NAVIGATION_SELECTOR, data);
        } else {
            app.pageController.loadMainNavigationWhenNoUserIsLoggedIn(context, MAIN_NAVIGATION_SELECTOR, {});
        }
    }

    function loadRecipeSearchMenu(context, selector) {
        if (localStorage.authKey) {
            app.pageController.loadRecipeSearchMenu(context, selector);
        }
    }

    let router = new Sammy(function () {
        this.before({ except: { path: '#\/(login|register)?' } }, function () {
            if (!localStorage.authKey) {
                this.redirect('#/');
                return false;
            }
        });

        this.get(app.appUrls.BASE_URL, function (context) {
            loadHeader(context, localStorage);
            loadRecipeSearchMenu(context, MAIN_RECIPE_SEARCH_MENU_SELECTOR);
            app.pageController.loadHomePage(context, MAIN_CONTENT_SELECTOR);
        });

        this.get(app.appUrls.LOGIN_URL, function (context) {
            app.pageController.loadLoginPage(context, MAIN_CONTENT_SELECTOR);
        });

        this.get(app.appUrls.REGISTER_URL, function (context) {
            app.pageController.loadRegisterPage(context, MAIN_CONTENT_SELECTOR);
        });

        this.get(app.appUrls.FOUND_USERS_URL, function (context) {
            app.pageController.loadFoundUsersPage(MAIN_CONTENT_SELECTOR, app.foundUsers);
        });

        this.get(app.appUrls.PROFILE_URL, function (content) {
            app.userController
                .getUserData()
                .then(response => {
                    app.pageController.loadProfilePage(MAIN_CONTENT_SELECTOR, response);
                });
        });

        this.get(app.appUrls.FOUND_RECIPES_URL, function () {
            app.pageController.loadRecipeSearchResult(MAIN_CONTENT_SELECTOR, app.reasultOfRecipeSearch);
        });

        // Events
        this.bind('redirectToUrl', function (event, url) {
            this.redirect(url);
        });

        this.bind('registerUser', function (event, data) {
            app.userController.registerUser(data);
        });

        this.bind('loginUser', function (event, data) {
            app.userController.loginUser(data);
        });

        this.bind('logoutUser', function (event, data) {
            app.userController.logoutUser();
        });

        this.bind('searchUsers', function (event, data) {
            app.userController.getFoundUser(MAIN_CONTENT_SELECTOR, data);
        });

        this.bind('getSearchedRecipeById', function (event, data) {
            app.pageController.loadSearchedRecipeById(data);
        });

        this.bind('addRecipeToFavorites', function (event, data) {
            app.recipeController.getRecipeById(data)
                .then(response => {
                    return app.userController.addRecipeToFavorites(response);
                });
        });

        this.bind('removeRecipeFromFavorites', function (event, data) {
            app.recipeController.getRecipeById(data)
                .then(response => {
                    return app.userController.removeRecipeFromFavorites(response);
                }).then(response => {
                    this.trigger('showFavoriteRecipes');
                });
        });

        this.bind('addRecipeToLikes', function (event, data) {
            app.recipeController.getRecipeById(data)
                .then(response => {
                    return app.userController.addRecipeToLikes(response);
                });
        });

        this.bind('removeRecipeFromLikes', function (event, data) {
            app.recipeController.getRecipeById(data)
                .then(response => {
                    return app.userController.removeRecipeFromLikes(response);
                }).then(response => {
                    this.trigger('showLikedRecipes');
                });
        });

        this.bind('showFavoriteRecipes', function (event) {
            app.userController
                .getUserFavoriteRecipes()
                .then(response => {
                    let recipes = response.favoriteRecipes,
                        favoriteRecipesSelector = '#favorite-recipes-container';

                    app.pageController.loadFavoriteRecipes(favoriteRecipesSelector, recipes);
                });
        });

        this.bind('showLikedRecipes', function (event) {
            app.userController.getUserLikedRecipes().then(response => {
                let recipes = response.likedRecipes,
                    likedRecipesSelector = '#favorite-recipes-container';

                app.pageController.loadLikedRecipes(likedRecipesSelector, recipes);
            })
        });

        this.bind('loadMoreRecipes', function (event) {
            app.recipeController
                .getRandomRecipes()
                .then(response => {
                    app.pageController
                        .addNewRecipes(MAIN_CONTENT_SELECTOR, response)
                        .then(success => {
                            app.pageView.hideMiniLoader();
                        });
                });
        });

        this.bind('showOtherUserFavourites', function (event, data) {
            app.userController
                .getFoundUserFavourites(data)
                .then(function (response) {
                    let favouriteRecipes = response.favoriteRecipes;

                    if (!favouriteRecipes || !favouriteRecipes.length) {
                        app.notificator.showNotification(app.messages.NOT_FOUND_FAVOURITE_RECIPES, 'error');
                    } else {
                        app.pageController.loadOtherUserFavourites(favouriteRecipes);
                    }
                });
        });
    });

    router.run(app.appUrls.BASE_URL);
} ());