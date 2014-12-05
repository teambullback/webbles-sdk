/*===========================================================================
	Webbles User Mode Library
	included in Webbles Project, Team Bullback
	Writen by LyuGGang(me@lyuwonkyung.com) on 14.08.11. ~

	Required Libraries (Dependencies):
	- jQuery (http://jquery.com/)
	- Bootstrap (http://getbootstrap.com/)
	- Font Awesome (http://fortawesome.github.io/Font-Awesome/)
	- jQuery: Smooth Scroll Plugin (https://github.com/balupton/jquery-scrollto)
	- jQuery: Sizzle Plugin (http://sizzlejs.com)
	- jQuery: Cookie Plugin (https://github.com/carhartl/jquery-cookie)

	Structure: 
	- Webbles Class

	Outer Templates: -

	Known Bugs: -

	TODOs: -

===========================================================================*/

function Webbles() {
		
	// load UM
	this.um = new UM();
};

Webbles.prototype = {

	// properties
	um: null,
	isPending: true,
	isContinued: false,
	bubbleInfos: null,
	presentStep: 0,

	startTutorial: function(bubleInfosFilePath) {

		var self = this;

		// load speech bubble informations
		$.getJSON(bubleInfosFilePath, function(data) {

			self.bubbleInfos = data.bubbleInfos;
			self.isPending = false;

			// play!!
			self.playBubble();

		}).fail(function(data) {

			throw "*WEBBLES* bubbleInfos.json(Tutorial information file) cannot loaded!";
		});
	},

	playBubble: function() {

		var self = this;

		// validate bubbleInfo.json loading finished
		if (self.isPending)
			throw "*WEBBLES* bubbleInfos.json(Tutorial information file) not loaded yet!";

		// 처음인지, 지속적인지 쿠키값을 체크한다.
		if ($.cookie('__webbles__lib__continuedStep__') == null) {

			// 처음이다
			// 0 부터 시작해주면 됩니다요.
			// console.log(this.getPageName());



			// page validation
			if (this.getPageName() != this.bubbleInfos[this.presentStep].document) {
				this.removeCookie('__webbles__lib__continuedStep__');
				throw {
					toString: function() {
						return "*WEBBLES* There is no tutorial step on this page!"
					},
					"RequestedTutorialStep": self.presentStep,
					"PageName": self.getPageName()
				};
			}

			this.um.setSpeechBubbleOnTarget(this.bubbleInfos[this.presentStep], function() {
				self.eachBubbleFinishedCallBack(self);
			});

		} else {

			// 아니다, 다른 페이지에서 계속된거다!
			console.log(this.getPageName());

			this.presentStep = parseInt($.cookie('__webbles__lib__continuedStep__'));
			// 날려주자
			this.removeCookie('__webbles__lib__continuedStep__');

			// page validation
			if (this.getPageName() != this.bubbleInfos[this.presentStep].document) {
				throw {
					toString: function() {
						return "*WEBBLES* There is no tutorial step on this page!"
					},
					"RequestedTutorialStep": self.presentStep,
					"PageName": self.getPageName()
				};
			}

			this.um.setSpeechBubbleOnTarget(this.bubbleInfos[this.presentStep], function() {
				self.eachBubbleFinishedCallBack(self);
			});
		}

	},

	eachBubbleFinishedCallBack: function(self) {


		// console.log(self.presentStep, self.bubbleInfos.length);
		// onActionCallBack
		if (self.presentStep < self.bubbleInfos.length - 1) {
			// 아직 끝나지 않았어!

			if (self.bubbleInfos[self.presentStep].trigger == "N") {
				// NEXT면.. recursion
				self.presentStep++;
				self.playBubble();
			} else if (self.bubbleInfos[self.presentStep].trigger == "C") {
				// CLICK이면.. 쿠키를 굽자~
				self.presentStep++;
				$.cookie('__webbles__lib__continuedStep__', String(self.presentStep), {
					'path': '/'
				});
			}

		} else {
			// 튜토리얼이 끝났음.


			// 날려주자
			self.removeCookie('__webbles__lib__continuedStep__');

			// TODO: 팝업을 띄워줘라!
			console.log("*WEBBLES* Tutorial Ends.");
		}
	},

	getPageName: function() {
		var pagePathName = window.location.pathname;
		// return pagePathName.substring(pagePathName.lastIndexOf("/") + 1);
		return pagePathName;

	},

	removeCookie: function(cookieName) {

		$.cookie(cookieName, null, {
			'expires': -1,
			'path': '/'
		});

	}

};

/*===========================================================================
	Bubble Library
	included in Webbles Project, Team Bullback
	Writen by LyuGGang(me@lyuwonkyung.com) on 14.08.11. ~

	Structure:
	- MM Class: Making Mode
	- UM Class: User Mode
	- generalUtil Class: General Utilities
	- speechBubble Class: Speech Bubble Frame Object

	Outer Templates:
	- plusBtn.html
	- speechBubble.html

	Known Bugs: -

	TODOs: -

===========================================================================*/



/*===========================================================================
// UM(User Mode) Class
===========================================================================*/
/*---------------------------------------------------------------------------
// constructor
---------------------------------------------------------------------------*/
function UM() {


	this.util = new generalUtil();



};

/*---------------------------------------------------------------------------
// prototype
---------------------------------------------------------------------------*/
UM.prototype = {

	/*-----------------------------------------------------------------------
	// vars
	-----------------------------------------------------------------------*/
	bubble: null,
	nowShowingBubble: null,
	util: null,


	/*-----------------------------------------------------------------------
	// methods
	-----------------------------------------------------------------------*/
	// 스피치 버블에 대한 정보를 넘겨 받으면, 해당 target element에 스피치 버블을 생성해줌.
	setSpeechBubbleOnTarget: function(bubbleInfo, onActionCallback) {

		var self = this;

		this.nowShowingBubble = new speechBubble(this);

		// target element 구하기
		var targetElement = this.util.getSpecificElementWithPathObj(bubbleInfo);


		// 141005: 스크롤 타겟을 버블에 맞추기 by LyuGGang
		switch (bubbleInfo.trigger) {
			// 트리거 종류에 맞게 다르게 처리해야(이벤트를 다르게 주어야)함.
			case "N":
				self.nowShowingBubble.makeNewBubble(targetElement, bubbleInfo, onActionCallback, null, self.nowShowingBubble.CONSTS.bubbleMakingMode.UM[bubbleInfo.trigger]); // onCationCallback();
				break;

			case "C":
				self.nowShowingBubble.makeNewBubble(targetElement, bubbleInfo, onActionCallback, null, self.nowShowingBubble.CONSTS.bubbleMakingMode.UM[bubbleInfo.trigger]);
				break;

			default:
				throw '** undefined bubble trigger!: ' + bubbleInfo.trigger;
				break;

		}

	},

	hideSpeechBubble: function() {

		// 현재 떠있는 bubble을 제거합니다. // 140917 by LyuGGang / DEV-22
		this.nowShowingBubble.onCancle(null);
	}
};



/*===========================================================================
// General Util Class
===========================================================================*/
/*---------------------------------------------------------------------------
// constructor
---------------------------------------------------------------------------*/
function generalUtil() {


};

/*---------------------------------------------------------------------------
// prototype
---------------------------------------------------------------------------*/
generalUtil.prototype = {


	dimScreenExceptTarget: function(targetElement, evtType, zoomRect) {

		// 타겟과 스피치버블과 우리것들빼고 다 어둡게!
		// 어짜피 우리것들은 z-index가 쩌니까........


		// 랲핑을 포기하고 바람개비를 도입한다! // 140912 by LyuGGang
		// 나중에 쓸 위치 및 크기 변수들
		var targetElementOffset = {
			location: $(targetElement).offset(),
			size: {
				width: $(targetElement).width(),
				height: $(targetElement).height()
			}
		};



		// location 을 padding 을 포함한 값으로 재정의
		// 원래 값으로 테스트 하고 싶을 때는 여기서부터
		targetElementOffset['size'] = {
			width: $(targetElement).innerWidth(),
			height: $(targetElement).innerHeight()
		};
		// 여기까지의 부분을 주석 처리하세요.

		var documentSize = {
			top: 0,
			left: 0,
			width: $(document).width(),
			height: $(document).height()
		};

		// // 줌 상태면
		// if(zoomRect !== null) {

		// 	// targetElementOffset.location.top += (zoomRect.y / zoomRect.scale);
		// 	// targetElementOffset.location.left += (zoomRect.x / zoomRect.scale);
		// 	documentSize.top += (zoomRect.y / zoomRect.scale) / 2;
		// 	documentSize.left += ((zoomRect.x / zoomRect.scale / 2) - targetElementOffset.size.width);
		// }

		// 하나짜리 dimElement는 더 이상 사용하지 않습니다. // 140911 by LyuGGang
		// var dimElement = "<div id='__goDumber__shadow__' style='background-image:url('static/images/shadow1x1.png'); position:absolute; left:0; top:0; width:100%; z-index:2147481000;'></div>";
		var dimElements = {
			top: "<div id=\"__goDumber__shadow__top\" class=\"___tbb___ __goDumber__shadow__\" style=\"background-image:url(" + this.getScriptPath() + "'static/images/shadow1x1.png'); position:absolute; top:0; z-index:2147481000;\"></div>",
			bottom: "<div id=\"__goDumber__shadow__bottom\" class=\"___tbb___ __goDumber__shadow__\" style=\"background-image:url(" + this.getScriptPath() + "'static/images/shadow1x1.png'); position:absolute; z-index:2147481000;\"></div>",
			left: "<div id=\"__goDumber__shadow__left\" class=\"___tbb___ __goDumber__shadow__\" style=\"background-image:url(" + this.getScriptPath() + "'static/images/shadow1x1.png'); position:absolute; top:0; left:0; z-index:2147481000;\"></div>",
			right: "<div id=\"__goDumber__shadow__right\" class=\"___tbb___ __goDumber__shadow__\" style=\"background-image:url(" + this.getScriptPath() + "'static/images/shadow1x1.png'); position:absolute; top:0; z-index:2147481000;\"></div>"
		};

		var transparentElement = "<div id='__goDumber__shadow__transparent' class='___tbb___ __goDumber__shadow__' style='position:absolute; z-index:2147481001;'></div>";

		// dimElements Init.
		$.each(dimElements, function(index, value) {
			$("body").append(value);
		});

		$("#__goDumber__shadow__top").css("top", documentSize.top);
		$("#__goDumber__shadow__top").css("left", documentSize.left + targetElementOffset.location.left);
		$("#__goDumber__shadow__top").css("height", targetElementOffset.location.top);
		$("#__goDumber__shadow__top").css("width", targetElementOffset.size.width);

		$("#__goDumber__shadow__bottom").css("top", documentSize.top + targetElementOffset.location.top + targetElementOffset.size.height);
		$("#__goDumber__shadow__bottom").css("left", documentSize.left + targetElementOffset.location.left);
		$("#__goDumber__shadow__bottom").css("height", documentSize.height - (targetElementOffset.location.top + targetElementOffset.size.height));
		$("#__goDumber__shadow__bottom").css("width", targetElementOffset.size.width);

		$("#__goDumber__shadow__left").css("top", documentSize.top);
		$("#__goDumber__shadow__left").css("left", documentSize.left);
		$("#__goDumber__shadow__left").css("width", targetElementOffset.location.left);
		$("#__goDumber__shadow__left").css("height", documentSize.height);

		$("#__goDumber__shadow__right").css("top", documentSize.top);
		$("#__goDumber__shadow__right").css("left", documentSize.left + targetElementOffset.location.left + targetElementOffset.size.width);
		$("#__goDumber__shadow__right").css("width", documentSize.width - (targetElementOffset.location.left + targetElementOffset.size.width));
		$("#__goDumber__shadow__right").css("height", documentSize.height);


		// 만약 제작모드(11, 12, null)이거나, 사용자모드 중 넥스트 이벤트이면(21) 투명 레이어를 사용하여 강조는 되지만 실제로 클릭은 되지 않도록 처리한다.
		// 원래는 enum 값인데.. speechBubble에 정의되어 있어서.. 가져다쓰기 귀찮으니.. ㅈㅅ
		switch (evtType) {
			case 21:
				if ($(targetElement)[0].tagName.toLowerCase() == "input") {
					// 만약 사용자모드&넥스트 이벤트(21) 인데, targetElement의 tag type이 "input"이며
					// "button" 혹은 "submit" Type이 아닌 경우에는 가리는 투명 레이어를 생성하지 않는다.
					var inputType = $($(targetElement)[0]).attr('type');
					if (inputType != "button" && inputType != "submit") {
						break;
					}
				}
			case 11:
			case 12:
			case null:
				$("body").append(transparentElement);
				$("#__goDumber__shadow__transparent").css("top", targetElementOffset.location.top);
				$("#__goDumber__shadow__transparent").css("left", targetElementOffset.location.left);
				$("#__goDumber__shadow__transparent").css("width", targetElementOffset.size.width);
				$("#__goDumber__shadow__transparent").css("height", targetElementOffset.size.height);
				break;
			case 22:
				break;
			default:
				throw '** Undefined Event(Trigger) Type!!: ' + evtType;
				break;

		}


	},

	getScriptPath: function() {
		var scriptPathes = $('script[src$="webbles-sdk.js"]').attr('src').split("/");
		var path = "";

		for(var i=0; i<scriptPathes.length - 1; i++){

			path += (scriptPathes[i] + "/");
		}

		return path;
	},

	restoreDimScreen: function(targetElement) {

		// 원복하기
		$('.__goDumber__shadow__').remove();
	},

	getAbsoluteElementPath: function(targetElement) {

		var self = this;

		// 외부 jQuery Plugin으로 변경합니다. 141009 by LyuGGang
		pathElements = {
			uniqueSelector: $(targetElement).getPath()
		};


		return pathElements;

	},

	getStringForElement: function(element) {
		var string = element.tagName.toLowerCase();
		//string = string.replace(/[!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g, "\\\\$&");

		// 가져온 element object가 배열인지 확인해서, 배열인경우 첫 번째 element object만 사용하도록 합니다.

		// TODO: 가져온 element가 <form>인 경우에 에러가 발생함.
		// http://login.daum.net/accounts/loginform.do?url=http%3A%2F%2Ftvpot.daum.net%2Fmypot%2FTop.do%3Fownerid%3Dfw8GSnkcmPA0
		// 에서 재현가능

		if ($.isArray(element))
			element = element[0];

		if (element.id) {

			// 혹시나 id에 jQuery Selector 예약어가 포함되어있는 경우 escape 처리합니다.
			var idTemp = element.id.trim().replace(/[!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g, "\\\\$&"); //replace("#", "\\\\#");
			string += "#" + idTemp; //element.id;
		}
		if (element.className) {

			// 혹시나 class에 jQuery Selector 예약어가 포함되어있는 경우 escape 처리합니다.
			var classTemp = element.className.trim().replace(/[!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g, "\\\\$&"); // ("#", "\\\\#");
			string += "." + classTemp.replace(/ /g, '.'); // element.className.replace(/ /g, '.');sizzle.js
		}

		return string;
	},

	// path object를 이용하여 해당 객체를 찾아서 리턴해줌.
	getSpecificElementWithPathObj: function(bubInfo) {

		// var ElementPathObj = bubInfo.dompath;


		try {

			// 더 이상 Path Object를 이용하지 않습니다. Unique Selector만 이용합니다. 141009 by LyuGGang
			var uniqueSelector = bubInfo.dompath.uniqueSelector;
			var curObj = null;

			// curObj = $(uniqueSelector);
			// using Sizzle jQuery Plugin (http://sizzlejs.com/)
			curObj = Sizzle(uniqueSelector);


			if (curObj != undefined && curObj != null && curObj.length != 0) {
				// 찾았다!
				return curObj;
			}

			// 끝까지 못찾으면 예외
			//throw '** Could not find specific element with path obj!';
			// chrome.runtime.sendMessage({
			// 	type: "element_not_found"
			// }, function(response) {});
		} catch (Exception) {

			// chrome.runtime.sendMessage({
			// 	type: "element_not_found"
			// }, function(response) {});

		}

	},

	preventALinks: function() {

		$("a").click(function(event) {

			event.preventDefault();
		});
	},

	restoreALinks: function() {

		$("a").click(function() {

			return true;
		});

	},

	// 해당 DOM Element의 모든 CSS(Style)을 가져온다.
	// from http://stackoverflow.com/questions/754607/can-jquery-get-all-css-styles-associated-with-an-element
	// usage: var style = getEveryStyle($("#elementToGetAllCSS"));
	// 		  $("#elementToPutStyleInto").css(style);
	getEveryStyle: function(a) {
		var sheets = document.styleSheets,
			o = {};
		for (var i in sheets) {
			var rules = sheets[i].rules || sheets[i].cssRules;
			for (var r in rules) {
				if (a.is(rules[r].selectorText)) {
					o = $.extend(o, this.css2json(rules[r].style), this.css2json(a.attr('style')));
				}
			}
		}
		return o;
	},

	css2json: function(css) {
		var s = {};
		if (!css) return s;
		if (css instanceof CSSStyleDeclaration) {
			for (var i in css) {
				if ((css[i]).toLowerCase) {
					s[(css[i]).toLowerCase()] = (css[css[i]]);
				}
			}
		} else if (typeof css == "string") {
			css = css.split("; ");
			for (var i in css) {
				var l = css[i].split(": ");
				s[l[0].toLowerCase()] = (l[1]);
			}
		}
		return s;
	}


}


/*===========================================================================
// Speech Bubble Class
===========================================================================*/
/*---------------------------------------------------------------------------
// constructor
---------------------------------------------------------------------------*/
function speechBubble(parentObj) {

	var self = this;



	// freeze Constants
	Object.freeze(self.CONSTS);


	self.parentObj = parentObj;


	self.util = new generalUtil();


};

/*---------------------------------------------------------------------------
// prototype
---------------------------------------------------------------------------*/
speechBubble.prototype = {

	CONSTS: {
		TEMPLATE: "",

		bubbleInfo: {
			"id": null,
			"title": null,
			"description": null,
			"dompath": null,
			"trigger": null,
			"is_init_document": true,
			"prev": null,
			"document": null,
			"etc_val": null,
		},

		triggers: {

			'next': "N",
			'click': "C"
		},

		bubbleMakingMode: {

			'MM': {
				'first': 11,
				'modify': 12
			},

			'UM': {
				'N': 21,
				'C': 22
			}
		}
	},


	bubble: null,
	onSaveCallback: null,
	onCancleCallback: null,
	onActionCallback: null,
	parentObj: null,
	util: null,
	selectedTrigger: null,
	target: null,
	isFirstSave: null,
	isZoomed: false,
	bubbleNowOnShowing: true,
	originTargetStyle: null,
	currentWindowSize: {
		width: null,
		height: null
	},
	currentTargetPosition: {
		top: null,
		left: null
	},

	makeNewBubble: function(targetElement, bubbleData, onActionCallback, onCancleCallback, bubbleMakingMode) {

		var self = this;
		this.target = targetElement;



		// 제작 모드
		switch (bubbleMakingMode) {
			case this.CONSTS.bubbleMakingMode.MM['first']:
			case this.CONSTS.bubbleMakingMode.MM['modify']:

				// 수정인가?아닌가?
				this.isFirstSave = (bubbleMakingMode == this.CONSTS.bubbleMakingMode.MM['first']) ? true : false;


				// get static pages(template)
				$.ajax({
					url: self.util.getScriptPath() + 'static/templates/speechBubble.html',
					success: function(data) {

						self.bubble = data;
						self.onSaveCallback = onActionCallback;
						self.onCancleCallback = onCancleCallback;

						$(self.target).popover({
							html: true,
							title: function() {
								if (!self.isFirstSave)
									return bubbleData.title;
								else
									return '수정하려면 클릭하세요';
							},
							content: function() {
								if (!self.isFirstSave)
									return bubbleData.description;
								else
									return '수정하려면 클릭하세요';
							},
							template: self.bubble,
							// placement: 'auto',
							// placement: self.get_popover_placement,
							placement: self.getBubblePlacement(bubbleData),
							trigger: 'manual',
							// container: 'html'
							container: 'body'
						});


						$(self.target).on('shown.bs.popover', function() {

							// Smooth Scrolling
							self.scroll($(self.target), $(".___tbb___.___tbb__tb___.___tbb__fa___.___tbb__sn___.___tbb__ee___.popover"), bubbleData);


						});


						$(self.target).popover('show');

						$("#__goDumber__popover__").css('z-index', '2147482000');

						$("#edit.popover-title").click(function() {
							self.onTitleEdit();
						});

						$("#edit.popover-content").click(function() {
							self.onContentEdit();
						});

						$("#__goDumber__trigger__").change(function() {
							self.onTriggerChanged();

						});

						$("#__goDumber__bubbleSaveBtn__").click(function() {
							self.onSave(targetElement);
						});

						$("#__goDumber__bubbleCancleBtn__").click(function() {
							self.onCancle(targetElement);
						});



					},
					fail: function() {
						throw "** COULD'T GET TEMPLATE FILE!";
					}
				});



				break;

			case this.CONSTS.bubbleMakingMode.UM[this.CONSTS.triggers['next']]:
			case this.CONSTS.bubbleMakingMode.UM[this.CONSTS.triggers['click']]:

				// 플레이 모드(User Mode)
				// throw 'Not implemented yet';

				// get static pages(template)
				$.ajax({
					url: self.util.getScriptPath() + 'static/templates/speechBubble.html',
					success: function(data) {

						self.bubble = data;
						// 액션이 일어난 이후의 콜백을 저장
						self.onActionCallback = onActionCallback;

						self.currentWindowSize.width = $(window).width();
						self.currentWindowSize.height = $(window).height();
						self.currentTargetPosition.top = $(self.target).offset().top;
						self.currentTargetPosition.left = $(self.target).offset().left;

						function doAfterResize() {

							self.util.dimScreenExceptTarget(self.target, bubbleMakingMode, null);

							// 버블 위치도 다시
							var popoverClass = ".___tbb___.___tbb__tb___.___tbb__fa___.___tbb__sn___.___tbb__ee___.popover";

							var deltaTop = parseFloat($(self.target).offset().top) - parseFloat(self.currentTargetPosition.top);
							var deltaLeft = parseFloat($(self.target).offset().left) - parseFloat(self.currentTargetPosition.left);


							$(popoverClass).css('top', parseFloat($(popoverClass).css('top')) + deltaTop);
							$(popoverClass).css('left', parseFloat($(popoverClass).css('left')) + deltaLeft);


							self.currentTargetPosition.top = $(self.target).offset().top;
							self.currentTargetPosition.left = $(self.target).offset().left;

						}


						$(window).resize(function() {

							// on window resized..

							if (self.isZoomed) {

								// 줌 상태면 줌을 풀어버려야지
								zoom.out({
									callback: function() {

										self.isZoomed = false;
										// 스크린 쉐도우 다시
										doAfterResize();


									}
								});
							} else {

								// self.util.dimScreenExceptTarget(self.target, bubbleMakingMode, null);
								doAfterResize();


							}

						});



						// element를 제외한 화면 어둡게.
						self.util.dimScreenExceptTarget(self.target, bubbleMakingMode, null);

						// 가져온 정보를 기반으로 스피치 버블 엘레멘트(div) 만들기
						// this.bubble = this.CONSTS.TEMPLATE;

						// append!
						$(self.target).popover({
							html: true,
							title: function() {
								return bubbleData.title;
							},
							content: function() {
								return bubbleData.description;
							},
							template: self.bubble,
							// placement: 'auto',
							// placement: self.get_popover_placement,
							placement: self.getBubblePlacement(bubbleData),
							trigger: 'manual',
							// container: 'html'
							container: 'body'
								// container: $(self.target)
						});

						$(self.target).on('shown.bs.popover', function() {

							// Smooth Scrolling
							self.scroll($(self.target), $(".___tbb___.___tbb__tb___.___tbb__fa___.___tbb__sn___.___tbb__ee___.popover"), bubbleData);
						});

						$(self.target).popover('show');


						// 템플릿에서 공통으로 필요없는 객체 제거
						$("#__goDumber__trigger__").remove();
						$("#__goDumber__bubbleSaveBtn__").remove();



						// click인경우 
						if (bubbleMakingMode == self.CONSTS.bubbleMakingMode.UM[self.CONSTS.triggers['click']]) {

							// next 버튼 제거
							$("#__goDumber__bubbleCancleBtn__").remove();

							// 해당 target Element에 onClick 이벤트를 걸어주어야함. 단 기존에 onClick 이벤트가 있을 수 있기 때문에 백업을 떠놓어야함.
							var originalClickEvt = $(self.target).attr('onclick'); //targetElement.onclick;

							// // onClick이 발생하였을 때 다음으로 넘어가게끔!!
							$(self.target).click(function() {

								// restore dim
								self.util.restoreDimScreen(self.target, self.originTargetStyle);

								if (self.bubbleNowOnShowing == true) {

									// window resize event 제거
									$(window).off('resize');

									self.onActionCallback();
									self.bubbleNowOnShowing = false;

								}

								// eval(originalClickEvt);

								// hide
								$(self.target).popover('hide');
								$('#__goDumber__popover__').popover('destroy');

							});

						} else if (bubbleMakingMode == self.CONSTS.bubbleMakingMode.UM[self.CONSTS.triggers['next']]) {

							// next인 경우

							// 기존의 cancle 버튼을 next(다음으로)버튼으로 변경
							$("#__goDumber__bubbleCancleBtn__inner__icon").removeClass('fa-times');
							$("#__goDumber__bubbleCancleBtn__inner__icon").addClass('fa-arrow-circle-right');
							$("#__goDumber__bubbleCancleBtn__inner__text").text('다음으로');


							// next 버튼 이벤트 등록
							$("#__goDumber__bubbleCancleBtn__").click(function() {

								$(self.target).on('hide.bs.popover', function() {


								})

								$(self.target).on('hidden.bs.popover', function() {

									// window resize event 제거
									$(window).off('resize');


									// zoom out 141022 by LyuGGang
									if (self.isZoomed) {
										zoom.out({
											callback: function() {
												// restore dim
												self.isZoomed = false;
												self.util.restoreDimScreen(self.target, self.originTargetStyle);
												self.onActionCallback();
											}
										});
									} else {

										self.util.restoreDimScreen(self.target, self.originTargetStyle);
										self.onActionCallback();
									}



								});

								// 팝업 닫기
								$(self.target).popover('hide');
								$('#__goDumber__popover__').popover('destroy');



							});


							if ($(self.target)[0].tagName.toLowerCase() == "input") {
								// targetElement의 tag type이 "input"이며
								// "button" 혹은 "submit" Type이 아닌 경우에는 tab이나 return 버튼을 누를 시 넥스트 이벤트로 간주해서
								// 강제로 이벤트를 firing 해준다.
								var inputType = $(self.target).attr('type');
								if (inputType != "button" && inputType != "submit") {

									// 키 인풋 이벤트 핸들러 등록
									$(self.target).bind('keydown', function(e) {

										if (e.keyCode == 9) { // 13: enter, 9: tap, 
											$("#__goDumber__bubbleCancleBtn__").click();
										}

										if (e.keyCode == 13) {
											e.preventDefault();
										}
									});
								}
							}



						}


					}
				});

				break;

			default:
				throw "** undefined speech bubble mode!: " + bubbleMakingMode;
				break;


		}



	},

	getBubblePlacement: function(bubbleData) {

		if (typeof bubbleData.etc_val.placement === "undefined" || bubbleData.etc_val.placement == null)
			return 'auto';
		else
			return bubbleData.etc_val.placement;
	},

	get_popover_placement: function(pop, dom_el) {
		var width = window.innerWidth;
		if (width < 500) return 'bottom';
		var left_pos = $(dom_el).offset().left;
		if (width - left_pos > 400) return 'right';
		return 'left';
	},

	onTitleEdit: function() {

		// DEV-70: Naver같은 곳에서 검색창에 Key Input Focus 빼앗기는 이슈 해결 // 140921 by LyuGGang
		$("#bubble #title .edit").bind('keydown', function(e) {

			e.stopImmediatePropagation();
		});

		$('#bubble #title .edit').summernote({
			airMode: true,
			airPopover: [
				['style', ['style']],
				['font', ['bold', 'italic', 'underline', 'strikethrough', 'clear']],
				['fontsize', ['fontsize']],
				['color', ['color']],
				['para', ['ul', 'ol']],
				['insert', ['link']],
			]
		});
	},

	onContentEdit: function() {

		// DEV-70: Naver같은 곳에서 검색창에 Key Input Focus 빼앗기는 이슈 해결 // 140921 by LyuGGang
		$("#bubble #content .edit").bind('keydown', function(e) {

			e.stopImmediatePropagation();
		});


		$('#bubble #content .edit').summernote({
			airMode: true,
			airPopover: [
				['style', ['style']],
				['font', ['bold', 'italic', 'underline', 'strikethrough', 'clear']],
				['fontsize', ['fontsize']],
				['color', ['color']],
				['para', ['ul', 'ol']],
				['insert', ['link']],
			]
		});
	},

	onSave: function(targetElement) {


		var self = this;

		var title = $('#bubble #title .edit').code();
		var content = $('#bubble #content .edit').code();
		this.onTriggerChanged();

		// wrapping된 객체를 원복시켜준다.
		// $(targetElement).unwrap();	
		var tempAbsolutePath = null;

		// zoom out
		self.isZoomed = false;
		zoom.out();


		try {
			// 먼저 정확도를 높이기 위해 element id와 순서를 동시에 이용해 path를 구한다.
			// 가 아니라 이제는 UniqueSelector를 구합니다. 141009 by LyuGGang
			tempAbsolutePath = this.util.getAbsoluteElementPath(targetElement);

		} catch (Exception) {

			// 실패하면(e.g. ID나 Class에 잘못된 값이 들어가 있는 경우) 알람을 띄워줍니다.
			// TODO: 이쁜 경고창으로 바꾸기
			alert('웹페이지의 해당 부분은 튜토리얼로 제작 할 수 없는 요소입니다. 불편을 드려 죄송합니다.'); // temporary alert

			self.onCancle(targetElement);
			return;

		}
		// 넘겨줄 실 bubble 객체를 생성한다.
		var bubbleInfo = Object.create(this.CONSTS.bubbleInfo);
		bubbleInfo.title = title;
		bubbleInfo.description = content;
		bubbleInfo.dompath = tempAbsolutePath; // this.util.getAbsoluteElementPath(targetElement);
		bubbleInfo.trigger = this.CONSTS.triggers[this.selectedTrigger];
		// target element의 innerHTML을 담아줌 - 140906 LyuGGang
		bubbleInfo.etc_val = {
			"innerHTML": $(targetElement).html(),
			"zoomPadding": null, // null이면 Zoom 안함. 확대 할 Element와 화면 경계 사이의 Padding이기 때문에, 이 값이 적으면 적을수록 더 확대가 되는 개념임.
			"placement": "auto"
		};

		this.onSaveCallback(this.isFirstSave, bubbleInfo); // (isFirstSave, bubbleInfo)

		// 실제 popover가 비동기로 제거되므로 이벤트를 등록한다.
		$(targetElement).on('hidden.bs.popover', function() {


			this.bubble = null;

			// 클릭 이벤트인 경우에는 이벤트 저장이 이루어진 이후에도 계속해서 해당 엘리멘트가 강조되어있도록 해야함.
			// dim toggle
			if (bubbleInfo.trigger == self.CONSTS.triggers['click']) {

				$('#__goDumber__popover__').popover('destroy');
				$(targetElement).popover('destroy');
				$(this).popover('destroy');

				// 말풍선띄워주기
				$(targetElement).popover({
					html: true,
					title: "",
					content: "Click 이벤트가 잘 저장되었습니다. <br />해당 아이템을 다시 눌러서 다음 스텝으로 진행해주세요!",
					template: "<div id='__goDumber__alert__popover' class='___tbb___ ___tbb__tb___ ___tbb__fa___ ___tbb__sn___ ___tbb__ee___ popover container-fluid' role='tooltip'><div class='arrow'></div><h3 class='popover-title'></h3><div class='popover-content'></div></div>",
					// placement: 'auto',
					// placement: self.get_popover_placement,
					placement: self.getBubblePlacement(bubbleInfo),
					trigger: 'manual',
					// container: 'html'
					container: 'body'


				});

				$("#__goDumber__shadow__transparent").remove();
				$(targetElement).popover('show');

				// 해당 타겟 element에 온클릭 이벤트를 걸어서
				// 쉐도우도 죽이고, 플러스 버튼도 날려준다.
				$(targetElement).click(function() {

					$(this.$bubbleIcon).hide();
					self.parentObj.toggleSwitchOnOff();
					self.util.restoreDimScreen(targetElement);

					$(targetElement).popover('hide');
					$(targetElement).popover('destroy');

				});



			} else {
				self.parentObj.toggleSwitchOnOff();
				self.util.restoreDimScreen(targetElement);
			}
		});

		$(targetElement).popover('hide');

	},

	onCancle: function(targetElement) {

		if (targetElement == null) {

			// target이 null이면 외부에서 강제 이벤트로 죽이는거임.
			targetElement = this.target;
		}


		if (this.parentObj.toggleSwitchOnOff != undefined)
			this.parentObj.toggleSwitchOnOff();

		// dim toggle
		this.util.restoreDimScreen(targetElement);

		$(targetElement).popover('hide');
		$('#__goDumber__popover__').popover('destroy');

		this.bubble = null;

		// Call the Callback Function // 140916 by LyuGGang
		if (this.onCancleCallback != null) {

			this.onCancleCallback();
		}

	},

	onTriggerChanged: function() {

		var str = "";

		// 추후에 트리거도 다중선택 가능할 수 있으니..
		$("#__goDumber__trigger__ option:selected").each(function() {


			str += $(this).text();

		});

		this.selectedTrigger = str;

		// 트리거가 변경되었음을 상태바에도 알려주어야함.
		this.parentObj.onNewBubbleAddedCallback(false, this.selectedTrigger);
	},

	// targetElement와 popoverElement를 조합한 가상의 span을 만들어 Smooth Scrolling 함.
	// 141014 by LyuGGang
	scroll: function(targetElement, popoverElement, bubbleData) {

		if (!bubbleData.etc_val.isScrollNeed) {
			return;
		}

		var self = this;

		// 가짜 span을 만들고
		var $inline = $('<span/>').css({
			'position': 'absolute',
			'top': '0px',
			'left': '0px'
		});

		var $container = $('body');

		// container(html)의 poistion을 백업하고
		var position = $container.css('position');

		// conatiner의 poistion을 relative로 변경하고
		$container.css({
			position: 'relative'
		});

		// 가짜 span을 conatiner에 appendTo()하고
		$inline.appendTo($container);

		// span의 위치와 크기를 targetElement와 popover를 포함하게끔 맞추고
		// 둘 중 더 작은게(더 위에 있는게) TOP
		var top = (targetElement.offset().top <= popoverElement.offset().top) ? targetElement.offset().top : popoverElement.offset().top;
		// 둘 중 더 작은게(더 왼쪽에 있는게) LEFT
		var left = (targetElement.offset().left <= popoverElement.offset().left) ? targetElement.offset().left : popoverElement.offset().left;
		// 둘 중 더 긴게 width, height
		var width = (targetElement.width() >= popoverElement.width()) ? targetElement.width() : popoverElement.width();
		var height = (targetElement.height() >= popoverElement.height()) ? targetElement.height() : popoverElement.height();

		// apply
		$inline.css('top', top);
		$inline.css('left', left);
		$inline.width(width);
		$inline.height(height);

		// 실제 스크롤링을 실행하고
		// $inline.ScrollTo({
		// // targetElement.ScrollTo({
		// 	callback: function() {

		// 		// 성공 콜백을 받은 후에
		// 		// span을 제거하고
		// 		$inline.remove();
		// 		// container의 poistion을 원복한다.
		// 		$container.css({
		// 			position: position
		// 		});

		// 	}
		// 	// , onlyIfOutside: true
		// });

		$.smoothScroll({


			scrollElement: $('body'),
			scrollTarget: $inline,
			// scrollTarget: popoverElement,
			afterScroll: function() {

				// $('#myStatus_user').scrollTo('#allbubble_user' + bubbleData.id, {
				// 	duration: 'slow'
				// });
				// $('#allbubble_user' + bubbleData.id).css('background-color', '#e8f1ff');
				// $('#count_block' + bubbleData.id).css('background-color', '#285f9c');
				// 성공 콜백을 받은 후에

				etc_val = bubbleData.etc_val; //JSON.parse(bubbleData.etc_val);

				// 성공 콜백을 받은 후에
				if (typeof etc_val.zoomPadding !== "undefined") {
					if (etc_val.zoomPadding !== null) {


						// zoom 해주고
						zoom.to({
							element: $inline[0],
							// x: $inline.offset().left,
							// y: $inline.offset().top,
							// scale: 2
							pan: false,
							padding: etc_val.zoomPadding, // 기본값 150
							callback: function(zoomRect) {
								self.isZoomed = true;
								//self.util.dimScreenExceptTarget(targetElement, 21, zoomRect);
							}
						});
					}
				}

				// span을 제거하고
				$inline.remove();
				// container의 poistion을 원복한다.
				$container.css({
					position: position
				});
			}

		});



	}
}


/*===========================================================================
// External Libraries
===========================================================================*/
/*!
 * zoom.js 0.3
 * http://lab.hakim.se/zoom-js
 * MIT licensed
 *
 * Copyright (C) 2011-2014 Hakim El Hattab, http://hakim.se
 */

var zoom;

$('body').ready(function() {

	zoom = (function() {

		// The current zoom level (scale)
		var level = 1;

		// The current mouse position, used for panning
		var mouseX = 0,
			mouseY = 0;

		// Timeout before pan is activated
		var panEngageTimeout = -1,
			panUpdateInterval = -1;

		// Timeout for call back function
		var callbackTimeout = -1;

		// Check for transform support so that we can fallback otherwise
		var supportsTransforms = 'WebkitTransform' in document.body.style ||
			'MozTransform' in document.body.style ||
			'msTransform' in document.body.style ||
			'OTransform' in document.body.style ||
			'transform' in document.body.style;

		if (supportsTransforms) {
			// The easing that will be applied when we zoom in/out
			document.body.style.transition = 'transform 0.8s ease';
			document.body.style.OTransition = '-o-transform 0.8s ease';
			document.body.style.msTransition = '-ms-transform 0.8s ease';
			document.body.style.MozTransition = '-moz-transform 0.8s ease';
			document.body.style.WebkitTransition = '-webkit-transform 0.8s ease';
		}

		// Zoom out if the user hits escape
		document.addEventListener('keyup', function(event) {
			if (level !== 1 && event.keyCode === 27) {
				zoom.out();
			}
		});

		// Monitor mouse movement for panning
		document.addEventListener('mousemove', function(event) {
			if (level !== 1) {
				mouseX = event.clientX;
				mouseY = event.clientY;
			}
		});

		/**
		 * Applies the CSS required to zoom in, prefers the use of CSS3
		 * transforms but falls back on zoom for IE.
		 *
		 * @param {Object} rect
		 * @param {Number} scale
		 */
		function magnify(rect, scale) {

			var scrollOffset = getScrollOffset();

			// Ensure a width/height is set
			rect.width = rect.width || 1;
			rect.height = rect.height || 1;

			// Center the rect within the zoomed viewport
			rect.x -= (window.innerWidth - (rect.width * scale)) / 2;
			rect.y -= (window.innerHeight - (rect.height * scale)) / 2;

			// 화면 밖으로 나가는 경우를 배제함 141026 by LyuGGang

			rect.x = (rect.x < 0) ? 0 : rect.x;
			rect.y = (rect.y < 0) ? 0 : rect.y;

			// if(rect.x + rect.width > document.body.clientWidth){

			//   // console.log('width over', rect.x, rect.width, document.body.clientWidth);
			//   //rect.width -= (rect.x + rect.width - document.body.clientWidth);
			//   rect.x -= (rect.x + rect.width - document.body.clientWidth);

			// }

			// if(rect.y + rect.height > document.body.clientHeight){

			//   // console.log('height over', rect.y, rect.height, document.body.clientHeight);
			//   // rect.height -= (rect.y + rect.height - document.body.clientHeight);
			//   rect.y -= (rect.y + rect.height - document.body.clientHeight);
			// }    

			if (supportsTransforms) {
				// Reset
				if (scale === 1) {
					document.body.style.transform = '';
					document.body.style.OTransform = '';
					document.body.style.msTransform = '';
					document.body.style.MozTransform = '';
					document.body.style.WebkitTransform = '';
				}
				// Scale
				else {
					var origin = scrollOffset.x + 'px ' + scrollOffset.y + 'px',
						transform = 'translate(' + -rect.x + 'px,' + -rect.y + 'px) scale(' + scale + ')';

					document.body.style.transformOrigin = origin;
					document.body.style.OTransformOrigin = origin;
					document.body.style.msTransformOrigin = origin;
					document.body.style.MozTransformOrigin = origin;
					document.body.style.WebkitTransformOrigin = origin;

					document.body.style.transform = transform;
					document.body.style.OTransform = transform;
					document.body.style.msTransform = transform;
					document.body.style.MozTransform = transform;
					document.body.style.WebkitTransform = transform;
				}
			} else {
				// Reset
				if (scale === 1) {
					document.body.style.position = '';
					document.body.style.left = '';
					document.body.style.top = '';
					document.body.style.width = '';
					document.body.style.height = '';
					document.body.style.zoom = '';
				}
				// Scale
				else {
					document.body.style.position = 'relative';
					document.body.style.left = (-(scrollOffset.x + rect.x) / scale) + 'px';
					document.body.style.top = (-(scrollOffset.y + rect.y) / scale) + 'px';
					document.body.style.width = (scale * 100) + '%';
					document.body.style.height = (scale * 100) + '%';
					document.body.style.zoom = scale;
				}
			}

			level = scale;

			return rect;
		}

		/**
		 * Pan the document when the mosue cursor approaches the edges
		 * of the window.
		 */
		function pan() {
			var range = 0.12,
				rangeX = window.innerWidth * range,
				rangeY = window.innerHeight * range,
				scrollOffset = getScrollOffset();

			// Up
			if (mouseY < rangeY) {
				window.scroll(scrollOffset.x, scrollOffset.y - (1 - (mouseY / rangeY)) * (14 / level));
			}
			// Down
			else if (mouseY > window.innerHeight - rangeY) {
				window.scroll(scrollOffset.x, scrollOffset.y + (1 - (window.innerHeight - mouseY) / rangeY) * (14 / level));
			}

			// Left
			if (mouseX < rangeX) {
				window.scroll(scrollOffset.x - (1 - (mouseX / rangeX)) * (14 / level), scrollOffset.y);
			}
			// Right
			else if (mouseX > window.innerWidth - rangeX) {
				window.scroll(scrollOffset.x + (1 - (window.innerWidth - mouseX) / rangeX) * (14 / level), scrollOffset.y);
			}
		}

		function getScrollOffset() {
			return {
				x: window.scrollX !== undefined ? window.scrollX : window.pageXOffset,
				y: window.scrollY !== undefined ? window.scrollY : window.pageYOffset
			}
		}

		return {
			/**
			 * Zooms in on either a rectangle or HTML element.
			 *
			 * (necessary)
			 * @param {Object} options
			 *
			 *   (necessary)
			 *   - element: HTML element to zoom in on
			 *   OR
			 *   - x/y: coordinates in non-transformed space to zoom in on
			 *   - width/height: the portion of the screen to zoom in on
			 *   - scale: can be used instead of width/height to explicitly set scale
			 *
			 *   (optional)
			 *   - callback: call back when zooming in ends
			 *   - padding: space around of zoomed in element
			 */
			to: function(options) {

				var zoomRect = null;

				// Due to an implementation limitation we can't zoom in
				// to another element without zooming out first
				if (level !== 1) {
					zoom.out();
				} else {
					options.x = options.x || 0;
					options.y = options.y || 0;

					// If an element is set, that takes precedence
					if (!!options.element) {
						// Space around the zoomed in element to leave on screen
						var padding = (typeof options.padding === "undefined") ? (20) : (options.padding);
						var bounds = options.element.getBoundingClientRect();

						options.x = bounds.left - padding;
						options.y = bounds.top - padding;
						options.width = bounds.width + (padding * 2);
						options.height = bounds.height + (padding * 2);
					}

					// If width/height values are set, calculate scale from those values
					if (options.width !== undefined && options.height !== undefined) {
						options.scale = Math.max(Math.min(window.innerWidth / options.width, window.innerHeight / options.height), 1);
					}

					if (options.scale > 1) {
						options.x *= options.scale;
						options.y *= options.scale;

						// options.x = (options.x < 0) ? 0 : options.x;
						// options.y = (options.y < 0) ? 0 : options.y;

						zoomRect = magnify(options, options.scale);

						if (options.pan !== false) {

							// Wait with engaging panning as it may conflict with the
							// zoom transition
							panEngageTimeout = setTimeout(function() {
								panUpdateInterval = setInterval(pan, 1000 / 60);
							}, 800);

						}

						if (!!options.callback) {
							callbackTimeout = setTimeout(function() {
								options.callback(zoomRect);
							}, 800);
						}
					}
				}

			},

			/**
			 * Resets the document zoom state to its default.
			 *
			 * (optional)
			 * @param {Object} options
			 *   (optional)
			 *   - callback: call back when zooming out ends
			 *
			 */
			out: function(options) {

				clearTimeout(panEngageTimeout);
				clearInterval(panUpdateInterval);
				clearTimeout(callbackTimeout);

				magnify({
					x: 0,
					y: 0
				}, 1);

				if (typeof options !== "undefined" && typeof options.callback !== "undefined") {
					setTimeout(function() {
						options.callback();
					}, 800);
				}

				level = 1;
			},

			// Alias
			magnify: function(options) {
				this.to(options)
			},
			reset: function() {
				this.out()
			},

			zoomLevel: function() {
				return level;
			}
		}

	})();


});


/*!
 * jQuery Smooth Scroll - v1.5.3 - 2014-10-15
 * https://github.com/kswedberg/jquery-smooth-scroll
 * Copyright (c) 2014 Karl Swedberg
 * Licensed MIT (https://github.com/kswedberg/jquery-smooth-scroll/blob/master/LICENSE-MIT)
 */

(function(factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define(['jquery'], factory);
	} else {
		// Browser globals
		factory(jQuery);
	}
}(function($) {

	var version = '1.5.3',
		optionOverrides = {},
		defaults = {
			exclude: [],
			excludeWithin: [],
			offset: 0,

			// one of 'top' or 'left'
			direction: 'top',

			// jQuery set of elements you wish to scroll (for $.smoothScroll).
			//  if null (default), $('html, body').firstScrollable() is used.
			scrollElement: null,

			// only use if you want to override default behavior
			scrollTarget: null,

			// fn(opts) function to be called before scrolling occurs.
			// `this` is the element(s) being scrolled
			beforeScroll: function() {},

			// fn(opts) function to be called after scrolling occurs.
			// `this` is the triggering element
			afterScroll: function() {},
			easing: 'swing',
			speed: 400,

			// coefficient for "auto" speed
			autoCoefficient: 2,

			// $.fn.smoothScroll only: whether to prevent the default click action
			preventDefault: true
		},

		getScrollable = function(opts) {
			var scrollable = [],
				scrolled = false,
				dir = opts.dir && opts.dir === 'left' ? 'scrollLeft' : 'scrollTop';

			this.each(function() {

				if (this === document || this === window) {
					return;
				}
				var el = $(this);
				if (el[dir]() > 0) {
					scrollable.push(this);
				} else {
					// if scroll(Top|Left) === 0, nudge the element 1px and see if it moves
					el[dir](1);
					scrolled = el[dir]() > 0;
					if (scrolled) {
						scrollable.push(this);
					}
					// then put it back, of course
					el[dir](0);
				}
			});

			// If no scrollable elements, fall back to <body>,
			// if it's in the jQuery collection
			// (doing this because Safari sets scrollTop async,
			// so can't set it to 1 and immediately get the value.)
			if (!scrollable.length) {
				this.each(function() {
					if (this.nodeName === 'BODY') {
						scrollable = [this];
					}
				});
			}

			// Use the first scrollable element if we're calling firstScrollable()
			if (opts.el === 'first' && scrollable.length > 1) {
				scrollable = [scrollable[0]];
			}

			return scrollable;
		};

	$.fn.extend({
		scrollable: function(dir) {
			var scrl = getScrollable.call(this, {
				dir: dir
			});
			return this.pushStack(scrl);
		},
		firstScrollable: function(dir) {
			var scrl = getScrollable.call(this, {
				el: 'first',
				dir: dir
			});
			return this.pushStack(scrl);
		},

		smoothScroll: function(options, extra) {
			options = options || {};

			if (options === 'options') {
				if (!extra) {
					return this.first().data('ssOpts');
				}
				return this.each(function() {
					var $this = $(this),
						opts = $.extend($this.data('ssOpts') || {}, extra);

					$(this).data('ssOpts', opts);
				});
			}

			var opts = $.extend({}, $.fn.smoothScroll.defaults, options),
				locationPath = $.smoothScroll.filterPath(location.pathname);

			this
				.unbind('click.smoothscroll')
				.bind('click.smoothscroll', function(event) {
					var link = this,
						$link = $(this),
						thisOpts = $.extend({}, opts, $link.data('ssOpts') || {}),
						exclude = opts.exclude,
						excludeWithin = thisOpts.excludeWithin,
						elCounter = 0,
						ewlCounter = 0,
						include = true,
						clickOpts = {},
						hostMatch = ((location.hostname === link.hostname) || !link.hostname),
						pathMatch = thisOpts.scrollTarget || ($.smoothScroll.filterPath(link.pathname) === locationPath),
						thisHash = escapeSelector(link.hash);

					if (!thisOpts.scrollTarget && (!hostMatch || !pathMatch || !thisHash)) {
						include = false;
					} else {
						while (include && elCounter < exclude.length) {
							if ($link.is(escapeSelector(exclude[elCounter++]))) {
								include = false;
							}
						}
						while (include && ewlCounter < excludeWithin.length) {
							if ($link.closest(excludeWithin[ewlCounter++]).length) {
								include = false;
							}
						}
					}

					if (include) {

						if (thisOpts.preventDefault) {
							event.preventDefault();
						}

						$.extend(clickOpts, thisOpts, {
							scrollTarget: thisOpts.scrollTarget || thisHash,
							link: link
						});

						$.smoothScroll(clickOpts);
					}
				});

			return this;
		}
	});

	$.smoothScroll = function(options, px) {
		if (options === 'options' && typeof px === 'object') {
			return $.extend(optionOverrides, px);
		}
		var opts, $scroller, scrollTargetOffset, speed, delta,
			scrollerOffset = 0,
			offPos = 'offset',
			scrollDir = 'scrollTop',
			aniProps = {},
			aniOpts = {};

		if (typeof options === 'number') {
			opts = $.extend({
				link: null
			}, $.fn.smoothScroll.defaults, optionOverrides);
			scrollTargetOffset = options;
		} else {
			opts = $.extend({
				link: null
			}, $.fn.smoothScroll.defaults, options || {}, optionOverrides);
			if (opts.scrollElement) {
				offPos = 'position';
				if (opts.scrollElement.css('position') === 'static') {
					opts.scrollElement.css('position', 'relative');
				}
			}
		}

		scrollDir = opts.direction === 'left' ? 'scrollLeft' : scrollDir;

		if (opts.scrollElement) {
			$scroller = opts.scrollElement;
			if (!(/^(?:HTML|BODY)$/).test($scroller[0].nodeName)) {
				scrollerOffset = $scroller[scrollDir]();
			}
		} else {
			$scroller = $('html, body').firstScrollable(opts.direction);
		}

		// beforeScroll callback function must fire before calculating offset
		opts.beforeScroll.call($scroller, opts);

		scrollTargetOffset = (typeof options === 'number') ? options :
			px ||
			($(opts.scrollTarget)[offPos]() &&
				$(opts.scrollTarget)[offPos]()[opts.direction]) ||
			0;

		aniProps[scrollDir] = scrollTargetOffset + scrollerOffset + opts.offset;
		speed = opts.speed;

		// automatically calculate the speed of the scroll based on distance / coefficient
		if (speed === 'auto') {

			// $scroller.scrollTop() is position before scroll, aniProps[scrollDir] is position after
			// When delta is greater, speed will be greater.
			delta = aniProps[scrollDir] - $scroller.scrollTop();
			if (delta < 0) {
				delta *= -1;
			}

			// Divide the delta by the coefficient
			speed = delta / opts.autoCoefficient;
		}

		aniOpts = {
			duration: speed,
			easing: opts.easing,
			complete: function() {
				opts.afterScroll.call(opts.link, opts);
			}
		};

		if (opts.step) {
			aniOpts.step = opts.step;
		}

		if ($scroller.length) {
			$scroller.stop().animate(aniProps, aniOpts);
		} else {
			opts.afterScroll.call(opts.link, opts);
		}
	};

	$.smoothScroll.version = version;
	$.smoothScroll.filterPath = function(string) {
		string = string || '';
		return string
			.replace(/^\//, '')
			.replace(/(?:index|default).[a-zA-Z]{3,4}$/, '')
			.replace(/\/$/, '');
	};

	// default options
	$.fn.smoothScroll.defaults = defaults;

	function escapeSelector(str) {
		return str.replace(/(:|\.)/g, '\\$1');
	}

}));

// ------------------------------------------------------------------------------------
// http://paste.blixt.org/297640
// http://stackoverflow.com/questions/2068272/getting-a-jquery-selector-for-an-element

jQuery.fn.getPath = function() {
	if (this.length != 1) throw 'Requires one element.';

	var path, node = this;
	while (node.length) {
		var realNode = node[0],
			name = realNode.localName;
		if (!name) break;

		name = name.toLowerCase();
		// form의 경우 form 내부에 hidden input 자식의 id가 "id"인 경우, realNode.id를 찍으면 해당 노드를 가르키게 된다.
		// 이에 오작동이 발생하므로, form인 경우를 realNode.length로 판가름 하여
		// form인 경우에 단순히 name(tagName)만 추가하도록 수정하고
		// 만약 같은 레벨에 form 객체가 여러게 있는 경우 단순히 시블링 순서로만 찾아 갈 수 있게끔 유도한다.
		// 141016 by LyuGGang
		if (typeof realNode.length == "undefined") {
			if (realNode.id) {
				// As soon as an id is found, there's no need to specify more.
				return name + '#' + realNode.id + (path ? '>' + path : '');
			} else if (realNode.className) {
				name += '.' + realNode.className.split(/\s+/).join('.');
			}
		}

		var parent = node.parent(),
			siblings = parent.children(name);
		if (siblings.length > 1) name += ':eq(' + siblings.index(node) + ')';
		path = name + (path ? '>' + path : '');

		node = parent;
	}

	return path;
};


// ------------------------------------------------------------------------------------

$.fn.getSelector = function() {
	var el = this[0];
	if (!el.tagName) {
		return '';
	}

	// If we have an ID, we're done; that uniquely identifies this element
	var el$ = $(el);
	var id = el$.attr('id');
	if (id) {
		return '#' + id;
	}

	var classNames = el$.attr('class');
	var classSelector;
	if (classNames) {
		classSelector = '.' + $.trim(classNames).replace(/\s/gi, '.');
	}

	var selector;
	var parent$ = el$.parent();
	var siblings$ = parent$.children();
	var needParent = false;
	if (classSelector && siblings$.filter(classSelector).length == 1) {
		// Classes are unique among siblings; use that
		selector = classSelector;
	} else if (siblings$.filter(el.tagName).length == 1) {
		// Tag name is unique among siblings; use that
		selector = el.tagName;
	} else {
		// Default to saying "nth child"
		// :nth 앞에만 '>' 를 붙여주어 sizzle library에서 정상적으로 인식이 가능하도록 합니다. 141011 by LyuGGang
		selector = '> :nth(' + $(this).index() + ')';
		needParent = true;
	}

	// Bypass ancestors that don't matter
	if (!needParent) {
		for (ancestor$ = parent$.parent(); ancestor$.length == 1 && ancestor$.find(selector).length == 1; parent$ = ancestor$, ancestor$ = ancestor$.parent());
		if (ancestor$.length == 0) {
			return selector;
		}
	}

	// selector 맨 앞에 .이나 #가 붙어있는 경우 앞에 ">"를 붙여준다. 141011 by LyuGGang
	// if(selector[0] == "." || selector[0] == "#")
	//   selector =  "> " + selector;

	return parent$.getSelector() + ' ' + selector;
}