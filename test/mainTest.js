var expect = chai.expect;
var assert = chai.assert;
var should = chai.should();


describe("Train Departure Tests", function() {
  var train = new TrainDeparture(),
      data = {
      	"services": [{
      		"serviceIdentifier": "W91621",
      		"serviceOperator": "SW",
      		"transportMode": "TRAIN",
      		"scheduledInfo": {
      			"scheduledTime": "2016-09-19T16:50:00+01:00"
      		},
      		"callingType": "PickUp",
      		"destinationList": [{
      			"crs": "RDG"
      		}],
      		"realTimeUpdatesInfo": {
      			"realTimeServiceInfo": {
      				"realTime": "2016-09-19T16:50:00+01:00",
      				"realTimePlatform": "18",
      				"realTimeFlag": "Estimate"
      			}
      		},
      		"callingPatternUrl": "https://realtime.thetrainline.com/callingPattern/W91621/2016-09-19"
      	}]
      };

    describe("TrainDeparture constructor.", function() {
      it("should exist when initialized.", function() {
        var spy = sinon.spy(window, 'TrainDeparture');
        var train = new TrainDeparture();

        expect(spy.called).to.be.equal(true);
      });
    });

    describe('getQuery method.', function() {
      //no to make a real call, fake server
      //create a response to work with.
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

          train.getQuery(function(result) {
              result.should.deep.equal(data);
              done();
          });

          this.requests[0].respond(200, { 'Content-Type': 'text/json' }, dataJson);
        });

        it('should not return data on a 400 Bad Request.', function(done) {
          train.getQuery(function(result) {
              result.should.not.to.be.deep.equal(data);
              done();
          });

          this.requests[0].respond(400);
        });

        it('should return error on a 400 Bad Request.', function(done) {
          train.getQuery(function(err) {
              err.should.exist;
              done();
          });

          this.requests[0].respond(400);
        });

        it('should return an error on a 500 Internal Server Error.', function(done) {
            train.getQuery(function(err) {
                err.should.exist;
                done();
            });

            this.requests[0].respond(500);
        });

      });

      describe('dataLoop method.', function() {
        it('should throw an error if called with no arguments.', function(done) {
          expect(train.dataLoop).to.throw();
          done();
        });

        it('should be called with right arguments.', function(done) {
          var spy = sinon.spy(train, 'dataLoop'),
              arr = [],
              el = "";
          spy(arr,el,arr);

          spy.firstCall.args;
          done();
        });
      });

      describe('dataSuccess method.', function() {
        it('should throw an error if called with no data.', function(done) {
          expect(train.dataSuccess).to.throw();
          done();
        });

      });
  });
