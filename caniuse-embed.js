function calcIframeHeight(e){var a=e.parentNode.offsetWidth,t="480px";return 400>a?t="690px":500>a?t="650px":600>a?t="590px":700>a&&(t="560px"),t}for(var caniuse_embeds=document.getElementsByClassName("ciu_embed"),i=0;i<caniuse_embeds.length;i++){var embed=caniuse_embeds[i],feature=embed.dataset.feature,iframeHeight=calcIframeHeight(embed);if(feature){var iframe='<iframe src="https://caniuse.bitsofco.de/embed/index.html?feat='+feature+'" frameborder="0" width="100%" height="'+iframeHeight+'"></iframe>';embed.innerHTML=iframe}else embed.innerHTML="A feature was not included. Add a caniuse feature ID to the 'data-feature' attribute of the element with class 'ciu_embed'."}window.onresize=function(e){for(var a=0;a<caniuse_embeds.length;a++){var t=caniuse_embeds[a],i=calcIframeHeight(t);t.childNodes[0].height=i}};