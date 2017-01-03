var expect = chai.expect;
var assert = chai.assert;
var should = chai.should();


describe("AzListing Tests", function() {

  var listing = new AzListing(),
      data =  {
                "character": "b",
                "count": 115,
                "page": 1,
                "per_page": 20,
                "elements": [{
                  "id": "p04cj7gf",
                  "type": "programme_large",
                  "title": "Babi Del: Ward Geni",
                  "images": {
                  "type": "image",
                  "standard": "https://ichef.bbci.co.uk/images/ic/{recipe}/p04cqmlc.jpg"
                  }
                }]
              };

    describe("AzListing constructor.", function() {
      beforeEach(function() {
        this.listing = new AzListing();
      });

      afterEach(function() {
        this.listing = null;
      });

      it("should call displayResultsByLetter.", function() {
        expect(this.listing.displayResultsByLetter).not.to.be.undefined;
      });

      it("should call paginateResults.", function() {
        expect(this.listing.paginateResults).not.to.be.undefined;
      });
    });

    describe('getQuery method.', function() {
      //no to make a real call, fake server
      //create a response to work with.
        var url = 'listing';
        beforeEach(function() {
            this.xhr = sinon.useFakeXMLHttpRequest();
            this.requests = [];
            this.xhr.onCreate = function(xhr) {
                this.requests.push(xhr);
            }.bind(this);
        });

        afterEach(function() {
            this.xhr.restore();
        });

        it('should return a successful response on a 200 status code.', function(done) {
          //Parse the response to json object first.
          var dataJson = JSON.stringify(data);

          listing.getQuery( url, function(result) {
              result.should.deep.equal(data);
              done();
          });

          this.requests[0].respond(200, { 'Content-Type': 'text/json' }, dataJson);
        });

        it('should return error on a 404 Not Found.', function(done) {
          listing.getQuery( url, function(err) {
              err.should.exist;
              done();
          });

          this.requests[0].respond(404);
        });

        it('should return an error on a 500 Internal Server Error.', function(done) {
            listing.getQuery( url, function(err) {
                err.should.exist;
                done();
            });

            this.requests[0].respond(500);
        });

      });

      describe('updateView method.', function() {
        it('should throw an error if called with no data.', function(done) {
          expect(listing.updateView).to.throw();
          done();
        });

      });
  });
