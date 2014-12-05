# Webbles-SDK

## Summary

- a SDK of Social Tutorial Platform [Webbles](https://webbles.net/). It enables every websites to use tutorial service without additional development.

- You can [try out the demo](https://webbles.net) on Webbles website. (Just click the '일단 한 번 해봐!' button.)

## Usage

### Installation

##### Using [Bower](http://bower.io/) (Recommended)

```bash
$ bower install webbles-sdk
```

##### From GitHub
Just download(or clone) sources to your website directory with other [required  libraries](#req).

### How to use in your source codes

- 1. Include script & css after [required  libraries](#req) in each pages.

```html
<script type="text/javascript" src="webbles-sdk/webbles-sdk.js"></script>
<link rel="stylesheet" href="webbles-sdk/webbles-sdk.css" />
```

- 2. Call a entry function where you want to start tutorial. such as..

```javascript
$("#btn").click(function(){
	var w = new Webbles();
	w.startTutorial("bubbleInfos.json"); // your tutorial step(bubble) information file path
});
```

- If your tutorial is composed of 2 pages or over, you have to call this function on 'body onload' of each pages except for first page. such as..

```javascript
$("body").ready(function(){
	var w = new Webbles();
	w.startTutorial("bubbleInfos.json"); // your tutorial step(bubble) information file path
});
```


### How to make tutorial step information file (bubbleInfos.json)
- Tutorial step information was written with JSON file.
- You can declare each step(bubble) in the bubbleInfos array.
- Properties
	- title: title of bubble
	- description: detailed description of bubble
	- dompath.uniqueSelector: CSS Selector of target element on document
	- trigger:
		- "N"(Next Event): bubble has a 'next button', so user can click **only the next button** on the bubble for progressing to next step.
		- "C"(Click Event): bubble has not a 'next button', so user can click **only the target element** on document for progressing to next step.
	- document: path of document which call this tutorial step 
	- etc_val (sorry for undersocre)
		- zoomPadding: padding value of between the target element and a zoomed screen border if you want to zoom. if you don't want, just type *null*. (default: 100)
		- isScrollNeed: whether you want to scroll to target element or not. (bool value)
		- placement: placement of bubble from target element. (*'top'*, *'right'*, *'bottom'*, *'left'* or *'auto'*)
- Sample of JSON
```json
{
	"bubbleInfos": [
		{
			"title": "Click Here!",
			"description": "Do you wanna see more?",
			"dompath": {
				"uniqueSelector": "#myBtn"
			},
			"trigger": "C",
			"document": "/index.html",
			"etc_val": {
				"zoomPadding": 100,
				"isScrollNeed": true,
				"placement": "auto"
			}
		},
        {
			"title": "What is Webbles?",
			"description": "Webbles(Web + Bubbles) is Social Tutorial Platform!",
			"dompath": {
				"uniqueSelector": ".menu > div > p"
			},
			"trigger": "N",
			"document": "/service/webbles.html",
			"etc_val": {
				"zoomPadding": null,
				"isScrollNeed": true,
				"placement": "auto"
			}
		}
	]
}
```
- We are developing a GUI tutorial making tool named 'Webbles Builder'. ([details](https://webbles.net/intro/))


<a name="req"></a>
### Requirements (Dependencies)
- [jQuery](http://jquery.com/)#1.11.1
- [Bootstrap](http://getbootstrap.com/)#2.3.2
- [jquery.cookie](https://github.com/carhartl/jquery-cookie)#1.4.1
- [Sizzle](http://sizzlejs.com/)#2.0.0

## License

MIT licensed

Copyrights (C) 2014 [TEAM BULLBACK](mailto:teambullback@gmail.com)