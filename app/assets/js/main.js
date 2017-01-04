 (function (exports) {
   'use strict';

  /**
   * This is the AzListing constructor
   * @constructor
   * @this {AzListing}
   */
    function AzListing() {
      this.programmeLetters = document.querySelectorAll( '.listing__order' );
      this.queryResults = document.querySelector( '.output' );

      this.displayResultsByLetter();
      this.paginateResults();
    }

    /**
     * getQuery make the ajax call to the feed.
     * @param {String} url passed to the proxy server (app.js line 46).
     * @param {Function} callback passed to response.
     * @param {HTMLElement} template html element to be compiled by handlebars.
     * @param {HTMLElement} parent element to render template, once compiled.
     */
    AzListing.prototype.getQuery = function ( url, callback, template, parent ) {
      var _this = this,
          deferred = $.Deferred();

      if ( _this.queryResults ) {
          _this.queryResults.classList.add('spinner');
      }

      $.ajax( {
          type: 'GET',
          url: '/listing'+ url,
          dataType:'json',
          success: onResponse,
          error: onError
      });

      /**
       * @param {Object} response returned from proxy request.
       */
      function onResponse( response ) {
        deferred.resolve( response );
        callback( response, template, parent );
      }

      function onError( response ) {
        deferred.reject( response );
        callback( (response.status +' '+ response.statusText), template, parent );
      }

      return deferred.promise();
    };

    /**
     * displayResultsByLetter make ajax call for each individual letter.
     */
    AzListing.prototype.displayResultsByLetter = function () {
      var _this =  this;

      //convert querySelectorAll NodeList in real array.
      [].forEach.call( this.programmeLetters, function ( letter ) {
        letter.addEventListener( 'click', function(){
          var value =  this.innerHTML,
              url = '?letter='+ value,
              template = document.querySelector('#output-results').innerHTML;

          //make ajax call.
          _this.getQuery( url, _this.handleRequest.bind(_this), template, _this.queryResults );

          $('.listing__order').removeClass('active');
          this.classList.add('active');
        });
      });
    };

    /**
     * paginateResults make ajax call for individual pagination item.
     */
    AzListing.prototype.paginateResults = function () {
      var _this =  this;

      $('.output').on('click', '.pagination a', function( e ) {
        e.preventDefault();

        var value =  this.innerHTML,
            pagination = document.querySelector('.pagination'),
            dataLetter = pagination.dataset.letter,
            url = '?letter='+ dataLetter +'&page='+ value,
            template = document.querySelector('#output-results-paginate').innerHTML,
            parent = document.querySelector('.output__items');

        //make ajax call.
        _this.getQuery( url, _this.handleRequest.bind(_this), template, parent );

        $('.pagination li').removeClass('active');
        this.parentNode.classList.add('active');
      });
    };

    /**
     * handleRequest deal with the ajax response.
     * @param  {Object} data Data passed from this.getQuery ajax response
     * @param {HTMLElement} template html el to be compiled by handlebars.
       @param {HTMLElement} parent el to append template once compiled.
     */
    AzListing.prototype.handleRequest = function ( data, template, parent ) {
      if ( !data && typeof data !== 'object' ) {
        throw new Error('Missing data.');
      }

      var items = [],
          pageNumber = [],
          _this =  this,
          pagination = {
            page : data.atoz_programmes.page,
            char : data.atoz_programmes.character,
            count : data.atoz_programmes.count,
            perPage : data.atoz_programmes.per_page,
            totalPages : Math.ceil( data.atoz_programmes.count / data.atoz_programmes.per_page ),
            pages: pageNumber
          },
          context = {
            'programmes': items,
            'pagination':pagination
          };

      //loop over total pages so we always have right amount of
      //pagination items.
      for ( var i = 1; i <= pagination.totalPages; i++ ) {
        pageNumber.push(i);
      }

      //pass data back to handlebars view
      data.atoz_programmes.elements.forEach( function( programme ) {
        items.push(programme);
      });

      //function call
      _this.handlebarsHelpers();
      _this.populateTemplate( context, template, parent );
    };

    /**
     * populateTemplate compile handlebars template after data received.
     * @param  {Object} data Data to be passed to handlebars in order to compile.
     * @param {HTMLElement} tmp element passed to Handlebars.compile.
       @param {HTMLElement} parent el to render template once compiled.
     */
    AzListing.prototype.populateTemplate = function ( data, tmp, parent ) {
      var tmpl = Handlebars.compile( tmp ),
          html = tmpl( data );

      parent.innerHTML = '';
      parent.innerHTML = html;

      if( this.queryResults ){
        this.queryResults.classList.remove('spinner');
      }
    };

    /**
     * handlebarsHelpers register some helpers to be used
     * in the view.
     */
    AzListing.prototype.handlebarsHelpers = function () {

      //ifGreater deal with comparing values, which in Handlebars,
      //it is not possible with if statement.
      Handlebars.registerHelper('ifGreater', function ( v1, v2, options ) {
        if (v1 > v2) {
          return options.fn(this);
        }

        return options.inverse(this);
      });

      //Helpers needed to do some string replacement on the data.
      Handlebars.registerHelper('replace', function ( find, replace, options ) {
      	var string = options.fn(this);
      	return string.replace( find, replace );
      });
    };

    //need to export the constructor to be able to unit test it.
    exports.AzListing = AzListing;
    return new AzListing();
})(this);
