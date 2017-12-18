/*
 * jQuery throttle / debounce - v1.1 - 3/7/2010
 * http://benalman.com/projects/jquery-throttle-debounce-plugin/
 * 
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */
(function(b,c){var $=b.jQuery||b.Cowboy||(b.Cowboy={}),a;$.throttle=a=function(e,f,j,i){var h,d=0;if(typeof f!=="boolean"){i=j;j=f;f=c}function g(){var o=this,m=+new Date()-d,n=arguments;function l(){d=+new Date();j.apply(o,n)}function k(){h=c}if(i&&!h){l()}h&&clearTimeout(h);if(i===c&&m>e){l()}else{if(f!==true){h=setTimeout(i?k:l,i===c?e-m:e)}}}if($.guid){g.guid=j.guid=j.guid||$.guid++}return g};$.debounce=function(d,e,f){return f===c?a(d,e,false):a(d,f,e!==false)}})(this);

/* global d3 */
$(window).load(function() {
	
	"use strict";
	
	// set up some variables that change from year to year
	var firstYear = 2000;
	var thisYear = 2018;

	// demo is set to false after first draw so it doesn't happen on refresh
	var demo = true;
	
	var demoDelay = 750; // time between year changes
	var demoYears = [2000, 2009, 2018]; // variable array length
	var demoTopic = "information_security"; // not implemented
	
	// user year selection persists across redraws
	// begin with first demo year for smooth transition
	var yearIndex = demoYears[0] - firstYear;

	var source_urls = [
		"http://www.educause.edu/ir/library/pdf/eqm002a.pdf",
		"http://www.educause.edu/ir/library/pdf/eqm01211.pdf",
		"http://www.educause.edu/ir/library/pdf/eqm0222.pdf",
		"http://www.educause.edu/ir/library/pdf/eqm0322.pdf",
		"http://er.educause.edu/articles/2004/1/current-it-issues-2004",
		"http://er.educause.edu/articles/2005/1/current-it-issues-2005",
		"http://er.educause.edu/articles/2006/1/topten-it-issues-2006",
		"http://er.educause.edu/articles/2007/1/topten-it-issues-2007",
		"http://er.educause.edu/articles/2008/5/topten-it-issues-2008",
		"http://er.educause.edu/articles/2009/7/topten-it-issues-2009",
		"http://er.educause.edu/articles/2010/6/topten-it-issues-2010",
		"http://er.educause.edu/articles/2011/5/topten-it-issues-2011",
		"http://er.educause.edu/articles/2012/6/topten-it-issues-2012",
		"http://er.educause.edu/articles/2013/6/topten-it-issues-2013-welcome-to-the-connected-age",
		"http://er.educause.edu/articles/2014/3/topten-it-issues-2014-be-the-change-you-see",
		"http://er.educause.edu/articles/2015/1/top-10-it-issues-2015-inflection-point",
		"http://er.educause.edu/articles/2016/1/top-10-it-issues-2016",
                "http://er.educause.edu/articles/2017/1/top-10-it-issues-2017-foundations-for-student-success",
		"https://www.educause.edu/research-and-publications/research/top-10-it-issues"
	];
	
	// global data variable declarations
	var tracks, lists;
	
	d3.text("files/tracks.txt", function(text) {
	
		tracks = $.parseJSON(text);
		
		d3.text("files/lists.txt", function(text) {
		
			lists = $.parseJSON(text);

			draw();
			
			// redraw only after user is done resizing
			$(window).resize($.debounce(100, function() {
				d3.selectAll('svg').remove();
				draw();
			}));
			
		}); // lists
		
	}); // tracks

	function draw() {
	
		// viewportWidth() is defined in head script
		var width = viewportWidth(),
			height = 560;
			
		$('#chart').width(width);
		$('#source').width(width);
		
		var svg = d3.select('#chart').append('svg').attr("width", width).attr("height", height),
			source = d3.select('#source');

		var rankX = 22; // center of rank label
		
		var buttonY = 10,
			buttonWidth = 46,
			buttonHeight = 22;

		var left = rankX*2 + buttonWidth/2; // leftmost data point
		var right = buttonWidth/2 + (rankX - 10); // rightmost data point

		var gap = 250; // gap created by active year

		var years = d3.range(firstYear, thisYear+1, 1);
		
		function x(i) {
		
			var step = (width - left - right - gap) / (years.length - 1);

			if (i < yearIndex) {
				return (i * step) + left;
			}
			else if (i === yearIndex) {
				return ((i * step) + gap/2) + left;
			}
			else {
				return ((i * step) + gap) + left;
			}
		}

		var y = d3.scale.linear().domain([0,10]).range([buttonY + buttonHeight*2, height]);

		// this holds track groups of lines and points
		var allTracks = svg.append("g")
			.attr("id", "trends")
			.attr("class", "trends");

		var beginCircleData,
			endCircleData;

		var line = d3.svg.line()
			.x(function(d) { return x(d.year - firstYear); })
			.y(function(d) { return y(d.rank - 1); })
			.interpolate("monotone");
	
		var rankColumn = svg.append("g")
			.attr("id", "rank-column")
			.attr("class", "rank-column");

		// 1-10 on the left
		rankColumn.selectAll(".rank-number")
			.data(d3.range(1,11,1))
			.enter()
			.append("text")
			.text(function(d) { return d; })
			.attr("class", "rank-number")
			.attr("y", function(d,i) { return y(i) + 10; })
			.attr("x", rankX);

		var yearButton = svg.selectAll(".year-button")
			.data(years)
			.enter()
			.append("rect")
			.attr("class", "year-button")
			.attr("width", buttonWidth)
			.attr("height", buttonHeight)
			.attr("rx", 3)
			.attr("ry", 3)
			.attr("x", function(d,i) { return x(i) - buttonWidth/2; })
			.attr("y", buttonY)
			.on("click", function(d,i) { yearClick(d); })
			.on("mouseover", function() { 
				if (! d3.select(this).classed("highlight") ) {
					d3.select(this).classed("selected", true);
				}	
			})
			.on("mouseout", function() {
				if (! d3.select(this).classed("highlight") ) {
					d3.select(this).classed("selected", false);
				}
			});	

		var yearLabels = svg.selectAll(".year-label")
			.data(years)
			.enter()
			.append("text")
			.text(function(d) { return d; })
			.attr("class", "year-label")
			.attr("x", function(d,i) { return x(i); })
			.attr("y", buttonY + buttonHeight/2)
			.attr("dy", "0.35em")
			.attr("pointer-events", "none");

		// Time period boxes
		//var timePeriod = svg.selectAll(".time-period")
		// 	.data([{"span": [firstYear,2006], "title": "Information Age"},{"span": [2011,2013], "title": "Connected Age"}])
		// 	.enter()
		// 	.append("rect")
		// 	.attr("class", "time-period")
		// 	.attr("width", function(d) {  console.log(x(d.span[1]-2001)-300);return x(d.span[1]-firstYear) -150} )
		// 	.attr("height", 10)
		// 	.attr("rx", 3)
		// 	.attr("ry", 3)
		// 	.attr("x", function(d) { return x(d.span[0]-2001) +100 })
		// 	.attr("y", "0");

		var trackGroup = allTracks.selectAll("g")
			.data(tracks)
			.enter()
			.append("g")
			.attr("class", "topic-group");

		trackGroup.selectAll("path")
			.data(function(d) { return d.paths; })
			.enter()
			.append("svg:path")
			.attr("d", line);

		trackGroup.selectAll(".loneCircle")
			.data(function(d) {
				return $.map(d.paths, function(p) { 
					if (p.length === 1) {
						return {"rank": p[0].rank, "year":p[0].year, "track":d.track};
					}
				});
			})
			.enter()
			.append("circle")
			.attr("class", "loneCircle")
			.attr("cx", function(d) { return x(d.year - firstYear); })
			.attr("cy", function(d) { return y(d.rank - 1); })
			.attr("r", 4);
		
		trackGroup.selectAll(".beginCircle")
			.data(function(d) {
				return $.map(d.paths, function(p) {
					if (p.length > 1) {
						return {"rank": p[0].rank, "year":p[0].year, "track":d.track};
					}
				});
			})
			.enter()
			.append("circle")
			.attr("class", "beginCircle")
			.attr("cx", function(d) { return x(d.year - firstYear); })
			.attr("cy", function(d) { return y(d.rank - 1); })
			.attr("r", 4);

		trackGroup.selectAll(".endCircle")
			.data(function(d) {
				return $.map(d.paths, function(p) { 
					if (p.length > 1) {
						return {"rank": p[p.length - 1].rank, "year":p[p.length - 1].year, "track":d.track};
					}
				});
			})
			.enter()
			.append("circle")
			.attr("class", "endCircle")
			.attr("cx", function(d) { return x(d.year - firstYear); })
			.attr("cy", function(d) { return y(d.rank - 1); })
			.attr("r", 4);
			
		if (demo) { // auto changer
			demoLoop(demoYears);
			demo = false;
		}
		else { // restore user's selection
			yearClick(firstYear + yearIndex);
		}
		
		function demoLoop(years) {
			if (years.length) {
				yearClick(years.shift(), years.length > 0);
				setTimeout(function() {
					demoLoop(years);
				}, demoDelay);
			}
		}
		
		function yearClick(year, demo) {

			// clean up
			source.selectAll(".source").remove();
			svg.selectAll(".issue").remove();
			svg.selectAll(".issue-box").remove();
			yearButton.classed("highlight selected", false);
			
			yearIndex = year - firstYear;

			// highlight selected year button
			d3.select(yearButton[0][yearIndex]).classed("highlight", true);

			// transitions
			yearLabels.transition()
				.attr("x", function(d,i) { return x(i); });

			yearButton.transition()
				.attr("x", function(d,i) { return x(i) - buttonWidth/2; });

			svg.selectAll("path")
				.transition()
				.attr("d", line);

			svg.selectAll("circle")
				.transition()
				.attr("cx", function(d) { return x(d.year - firstYear); })
				.attr("cy", function(d) { return y(d.rank - 1); });

			// draw "light box," issue list, and source link
			var boxWidth = gap + buttonWidth;

			svg.append("rect")
				.attr("class", "issue-box")
				.attr("width", boxWidth)
				.attr("height", height)
				.attr("x", x(yearIndex) - boxWidth/2)
				.attr("y", buttonY + buttonHeight);
				
			var issues = svg.selectAll(".issue")
				.data(lists[yearIndex].issues)
				.enter()
				.append("text")
				.attr("class", "issue")
				.attr("x", x(yearIndex))
				.attr("y", function(d,i) {
				
					var factor = 9;
					var offset = 8;
					var offsetTie = offset - factor - 2;
					var offsetTie2 = offsetTie + parseFloat($('.issue').css("font-size")) + 2;

					// UGLY -- fixing the ties
					if (yearIndex === 4) {
						if (i === 9) {
							return  y(i) - d.split('|').length * factor + offsetTie;
						}
						else if (i === 10) {
							return  y(i-1) - d.split('|').length * factor + offsetTie2;
						}
						else {
							return  y(i) - d.split('|').length * factor + offset;
						}
					}
					else if (yearIndex === 10) {
						if (i === 5) {
							return  y(i) - d.split('|').length * factor + offsetTie;
						}
						else if (i === 6) {
							return  y(i-1) - d.split('|').length * factor + offsetTie2;
						}
						else if (i > 6) {
							return  y(i-1) - d.split('|').length * factor + offset;
						}
						else {
							return  y(i) - d.split('|').length * factor + offset;
						}
					}
					else if (yearIndex === 14) {

						if (i === 9) {
							return  y(i) - d.split('|').length * factor + offsetTie;
						}
						else if (i === 10) {
							return  y(i-1) - d.split('|').length * factor + offsetTie2;
						}
						else {
							return  y(i) - d.split('|').length * factor + offset;
						}
					}
					else if (yearIndex === 18) {
						if (i === 7) {
							return  y(i) - d.split('|').length * factor + offsetTie;
						}
						else if (i === 8) {
							return  y(i-1) - d.split('|').length * factor + offsetTie2;
						}
//						else if (i > 8) {
//							return  y(i-1) - d.split('|').length * factor + offset;
//						}
						else {
							return  y(i) - d.split('|').length * factor + offset;
						}
					}
					else {
						return  y(i) - d.split('|').length * factor + offset;
					}
				});
				
			issues.selectAll("tspan")
				.data(function(d) { return d.split("|"); })
				.enter()
				.append("tspan")
				.text(function(d) { return d; })
				.attr("dy", 15)
				.attr("x", x(yearIndex));

			// SOURCE LINKS
			source.append("div")
				.attr("class", "source")
				.style("width", boxWidth + "px")
				.style("left", x(yearIndex) - boxWidth/2 + "px")
				.append("a")
				.attr("href", source_urls[yearIndex])
				.attr("target", "_blank")
				.text("Source: " + year + " IT Issues Report");
								
			issues.on("mouseover", function(e,i) {
			
				if (demo) { return; }
				
				d3.select(this).classed("selected", true);
				
				var track;
				var rank;

				// UGLY -- fixing the ties
				if (yearIndex === 4) {
					if (i === 10) {
						track = "governance";
						rank = 10;
					}
					else {
						track = reverseTrack(yearIndex, i);
						rank = i + 1;
					}
				}
				else if (yearIndex === 10) {
					if (i === 5) {
						track = "disaster";
						rank = 6;
					}
					else if (i === 6) {
						track = "governance";
						rank = 6;
					}
					else if (i > 6) {
						track = reverseTrack(yearIndex, i-1);
						rank = i;
					}
					else {
						track = reverseTrack(yearIndex, i);
						rank = i + 1;
					}
				}
				else if (yearIndex === 14) {
					if (i === 10) {
						track = "enterprise_architecture";
						rank = 10;
					}
					else {
						track = reverseTrack(yearIndex, i);
						rank = i + 1;
					}
				}
				else if (yearIndex === 18) {
					if (i === 7) {
						track = "digital_integrations";
						rank = 8;
					}
					else if (i === 8) {
						track = "data_management";
						rank = 8;
					}
//					else if (i > 8) {
//						track = reverseTrack(yearIndex, i-1);
//						rank = i;
//					}
					else {
						track = reverseTrack(yearIndex, i);
						rank = i + 1;
					}
				}
				else {
					track = reverseTrack(yearIndex, i);
					rank = i + 1;
				}

				rankColumn.selectAll(".rank-number")
					.filter(function(d) { return (d === rank) ? this : null; })
					.classed("selected", true);

				trackGroup
					.filter(function(d) { return (d.track === track) ? this : null; })
					.classed("selected", true)
					.bringToFront()
					.selectAll(".loneCircle")
					.attr("r", 6);
				
			})
			.on('mouseout', function() {
			
				trackGroup
					.classed("selected", false)
					.selectAll(".loneCircle")
					.attr("r", 4);
				rankColumn.selectAll(".rank-number").classed("selected", false);
				d3.select(this).classed("selected", false);
				
			});

		} // yearClick
		
	} // draw
	 
	function reverseTrack(year, rank) {
		var yearfilter = [];
		$.each(tracks, function(i, d) { 
			$.each(d.paths, function(i, t) {
				$.each(t, function(i, s) {
					if (+s.year === (year + firstYear) && +s.rank === rank + 1) {
						yearfilter.push(d);
					}
				});
			});
		});
		if (yearfilter.length > 0) {
			return yearfilter[0].track;
		}
	}

	d3.selection.prototype.bringToFront = function() {
		return this.each(function() {
			this.parentNode.appendChild(this);
		});
	};
	 
});
