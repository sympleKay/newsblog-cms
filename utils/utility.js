module.exports = {
    ensureAuth: function (req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        } else {
            req.flash('logout', 'Login to access this resource');
            res.redirect('/');
        }
    },

    ensureGuest: function (req, res, next) {
        if (req.isAuthenticated()) {
            res.redirect('/');
        } else {
            return next();
        }

    },
    ensureAdminGuest: function (req, res, next) {
      if (req.isAuthenticated()) {
        res.redirect('/admin/dashboard');
      } else {
        return next ();
      }
    },
    truncate: function(str, length, ending) {
        if (length == null) {
          length = 100;
        }
        if (ending == null) {
          ending = '...';
        }
        if (str.length > length) {
          return str.substring(0, length - ending.length) + ending;
        } else {
          return str;
        }
    },
    parseUsername: function (str) {
      let username = str.toLowerCase();
      let newUsername = username.replace(/\s/g, '_');
      return newUsername;
    },
    parseEmail: function (str) {
      let email = str.toLowerCase();
      return email;
    }
}