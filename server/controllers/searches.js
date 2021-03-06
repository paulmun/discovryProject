'use strict';

(function(){
	var https = require('https');
	var mongoose = require('mongoose'),
		Search = mongoose.model('Search'),
		SearchResult = mongoose.model('SearchResult');

	function searchController(){
		
		this.all = function(req, res){
			//replace spaces with '+' for query
			var query = req.body.search.replace(' ','+');

			//grab API key from DB
			Search.find().exec(function(err, key){
				if(err)res.json(err);

				//setup for api call. results are sorted by viewCount and limited to the top 10.
				var options = {
					host: 'www.googleapis.com',
					path: '/youtube/v3/search?part=snippet&maxResults=10&order=viewCount&q='+query+'&type=channel&key='+key[0].value
				};
				
				var callback = function(response){
					var str = '';

					response.on('data', function(chunk){
						str += chunk;
					});
					//send json response to front-end
					response.on('end', function(){
						console.log(str);
						str = JSON.parse(str);
						res.json(str);
					});
				}

				https.request(options, callback).end();

			});

		}

		this.finder = function(req, res){
			Search.find().exec(function(err, key){
				if(err)res.json(err);

				var options = {
					host: 'www.googleapis.com',
					path: '/youtube/v3/channels?part=statistics&maxResults=1&id='+req.body.chId+'&key='+key[0].value
				};
				
				var callback = function(response){
					var str = '';

					response.on('data', function(chunk){
						str += chunk;
					});
					//send json response to front-end
					response.on('end', function(){
						console.log(str);
						str = JSON.parse(str);
						res.json(str);
					});
				}

				console.log('sendingAPIRequest');

				https.request(options, callback).end();

			});
		}

		this.saveSearch = function(req, res){
			console.log(req.body);
			for(var i = 0; i < req.body.data.length; i++){
				var searchResult = new SearchResult({
					title: req.body.data[i].snippet.channelTitle,
					description: req.body.data[i].snippet.description,
					id: req.body.data[i].id.channelId,
					subscribers: req.body.data[i].statistics.subscriberCount,
					videoCount: req.body.data[i].statistics.videoCount,
					viewCount: req.body.data[i].statistics.viewCount,
					query: req.body.query
				});

				searchResult.save(function(err, result){
					if(err)res.json(err);
					else{
						console.log(result);
					}
				});
			}
			res.json({data: 'succes'})
		}

	}

	module.exports = new searchController();

})();