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
     * @param {String} url passed to the proxy server
     * @param {Function} callback in this case this.updateView
     */
    AzListing.prototype.getQuery = function ( url, callback ) {

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
         * @param {Object} response returned from
         */
        function onResponse( response ) {
            deferred.resolve( response );
            callback(response);
        }

        /**
         * @param {Object} response
         */
        function onError( response ) {
            deferred.reject( response );
            callback((response.status +' '+ response.statusText));
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
              results = $( '#output-results' ).html();

          //make ajax call.
          _this.getQuery( url, _this.updateView.bind(_this, results) );

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
            results = $( '#output-pagination-results' ).html();

        //make ajax call.
        _this.getQuery( url, _this.updateView.bind(_this, results) );
      });
    };

    /**
     * updateView deal with the ajax response and pass it back to handlebars view.
     * @param  {Object} data Data passed from this.getQuery ajax response
     */
    AzListing.prototype.updateView = function ( data, template ) {

      if ( !data && typeof data !== 'object' ) {
        throw new Error('Missing data.');
      }

      var items = [],
          item,
          pagNumber = [],
          _this =  this,
          pagination = {
            page : data.atoz_programmes.page,
            char : data.atoz_programmes.character,
            count : data.atoz_programmes.count,
            perPage : data.atoz_programmes.per_page,
            totalPages : Math.ceil( data.atoz_programmes.count / data.atoz_programmes.per_page ),
            pages: pagNumber
          },
          context = {
            'programmes': items,
            'pagination':pagination
          };

      //loop over total pages so we always have right amount of
      //pagination items.
      for ( var i = 1; i <= pagination.totalPages; i++ ) {
        pagNumber.push(i);
      }

      //pass data back to handlebars view
      data.atoz_programmes.elements.forEach( function( programme ) {
        items.push(programme);
      });

      _this.handlebarsHelpers();
      _this.populateTemplate( context, template )

    };

    /**
     * populateTemplate description
     * @return {[type]} [description]
     */
    AzListing.prototype.populateTemplate = function ( data, template ) {
      var tmp = Handlebars.compile( template ),
          html = template( data );

          //lets empty the html before a new call it is made.
          _this.queryResults.innerHTML = '';

          _this.queryResults.innerHTML = html;

          _this.queryResults.classList.remove('spinner');
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

      //Helpers needed to do some string replacement
      Handlebars.registerHelper('replace', function ( find, replace, options ) {
      	var string = options.fn(this);
      	return string.replace( find, replace );
      });

    };

    //need to export the constructor to be able to unit test it.
    exports.AzListing = AzListing;
    return new AzListing();
})(this);
