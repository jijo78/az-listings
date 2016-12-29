 (function (exports) {
   'use strict';

  /**
   * This is the AzListing constructor
   * @constructor
   * @this {AzListing}
   */
    function AzListing() {
      var _this = this;

      //Global element.
      this.programmeLetters = document.querySelectorAll( '.listing__order' );
      this.queryResults = document.querySelector( '.output' );
      this.queryResultsContainer = document.querySelector( '.output__items' );


      //Actions
      [].forEach.call( this.programmeLetters, function ( letter ) {
        letter.addEventListener( 'click', function(){
            var value =  this.innerHTML,
                url = '?letter='+ value;

          _this.getQuery( url, _this.dataSuccess.bind(_this) );

          $('.listing__order').removeClass('active');
          this.classList.add('active');
        });
      });

      $('.output').on('click', '.pagination a', function( e ) {
        e.preventDefault();

        var value =  this.innerHTML,
            pagination = document.querySelector('.pagination'),
            dataLetter = pagination.dataset.letter,
            url = '?letter='+ dataLetter+'&page='+ value,
            target = e.target;

        _this.getQuery( url, _this.dataSuccess.bind(_this) );
        target.classList.remove('active');

        e.currentTarget.classList.add('active');
      });

    }

    /**
     * getQuery make the ajax call to the feed.
     * @param {[Function]} callback
     */
    AzListing.prototype.getQuery = function ( url, callback ) {

      var _this = this,
          deferred = $.Deferred();

          _this.queryResults.classList.add('spinner');

        $.ajax( {
            type: 'GET',
            url: '/listing'+ url,
            dataType:'json',
            success: onResponse,
            error: onError
        });

        /**
         * Return a successful promise
         * @param {[Object]} response
         */
        function onResponse( response ) {
            deferred.resolve( response );
            callback(response);
        }

        /**
         * Return an error on rejection
         * @param {[Object]} response
         */
        function onError( response ) {
            deferred.reject( response );
            callback((response.status +' '+ response.statusText));
        }

        //function addClass(){
        //   var elements = document.querySelectorAll( '.pagination a' ); // grab a reference to your element
        //   [].forEach.call( elements, function ( element ) {
        //     var elementIsClicked = false; // declare the variable that tracks the state
        //     function clickHandler(){ // declare a function that updates the state
        //       elementIsClicked = true;
        //       console.log(elementIsClicked);
        //       this.classList.add('active');
        //     }
        //     element.addEventListener( 'click', clickHandler);
        //   });
        // }


        return deferred.promise();
    };

    /**
     * dataLoop is an helper function that loop over the data returned.
     * @param  {[Array]}   arr
     * @param  {[Any]}   callBackArg
     * @param  {[Array]}   newArr
     */
    AzListing.prototype.dataLoop = function ( arr, callBackArg ,newArr ) {
      //safe check to make sure all arguments are passed in, and they are
      //of the right type.
      if($.isArray( arr ) &&
        callBackArg !== null &&
        $.isArray(newArr)
      ){
        arr.forEach( function( callBackArg ) {
          newArr.push(callBackArg);
        });
      } else{
        throw new Error('Missing Argument or Argument is of the wrong type.');
      }
    };

    /**
     * dataSuccess deal with the data and pass it back to handlebars view.
     * @param  {[Object]}   data
     */
    AzListing.prototype.dataSuccess = function ( data ) {
      //lets check we have some data back, and the data is the right format before we proceed.
      if( !data && typeof data !== 'object' ){
        throw new Error('Missing data.');
      }

      //lets store the feed in an array so we can let the view deal with the looping.
      var items = [],
          item,
          pagNumber = [],
          _this =  this,
          template = Handlebars.compile( $( '#output-results' ).html() ),
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

      for( var i = 1; i <= pagination.totalPages; i++ ){
        pagNumber.push(i);
      }

      //lets empty the html before a new call
      _this.queryResults.innerHTML = '';

      //call to helpers
      _this.handlebarsHelpers();

      if( data.atoz_programmes.elements ){
        _this.dataLoop( data.atoz_programmes.elements, item, items );
        var html = template( context );
        _this.queryResults.innerHTML = html;
        _this.queryResults.classList.remove('spinner');
      }
      
    };

    /**
     * handlebarsHelpers register some helpers to be used
     * in the view.
     */
    AzListing.prototype.handlebarsHelpers = function ( ) {

      //equal deal with comparing values, which in Handlebars,
      //it is not possible with if statement.
      Handlebars.registerHelper( 'ifCond', function( v1, v2, options ) {
        if(v1 > v2) {
          return options.fn(this);
        }
        return options.inverse(this);
      });

      Handlebars.registerHelper( 'replace', function( find, replace, options ) {
      	var string = options.fn(this);
      	return string.replace( find, replace );
      });

    };
    //need to export the constructor to be able to unit test it.
    exports.AzListing = AzListing;
    return new AzListing();
})(this);
