define("willkan/foundation/4.3.1/foundation/foundation.magellan",["willkan/foundation/4.3.1/foundation/foundation","$"],function(a){var b=window.Foundation||a("willkan/foundation/4.3.1/foundation/foundation");!function(a,c){"use strict";b.libs.magellan={name:"magellan",version:"4.2.2",settings:{activeClass:"active",threshold:0},init:function(c,d,e){return this.scope=c||this.scope,b.inherit(this,"data_options"),"object"==typeof d&&a.extend(!0,this.settings,d),"string"!=typeof d?(this.settings.init||(this.fixed_magellan=a("[data-magellan-expedition]"),this.set_threshold(),this.last_destination=a("[data-magellan-destination]").last(),this.events()),this.settings.init):this[d].call(this,e)},events:function(){var b=this;a(this.scope).on("arrival.fndtn.magellan","[data-magellan-arrival]",function(){var c=a(this),d=c.closest("[data-magellan-expedition]"),e=d.attr("data-magellan-active-class")||b.settings.activeClass;c.closest("[data-magellan-expedition]").find("[data-magellan-arrival]").not(c).removeClass(e),c.addClass(e)}),this.fixed_magellan.on("update-position.fndtn.magellan",function(){a(this)}).trigger("update-position"),a(c).on("resize.fndtn.magellan",function(){this.fixed_magellan.trigger("update-position")}.bind(this)).on("scroll.fndtn.magellan",function(){var d=a(c).scrollTop();b.fixed_magellan.each(function(){var c=a(this);"undefined"==typeof c.data("magellan-top-offset")&&c.data("magellan-top-offset",c.offset().top),"undefined"==typeof c.data("magellan-fixed-position")&&c.data("magellan-fixed-position",!1);var e=d+b.settings.threshold>c.data("magellan-top-offset"),f=c.attr("data-magellan-top-offset");c.data("magellan-fixed-position")!=e&&(c.data("magellan-fixed-position",e),e?(c.addClass("fixed"),c.css({position:"fixed",top:0})):(c.removeClass("fixed"),c.css({position:"",top:""})),e&&"undefined"!=typeof f&&0!=f&&c.css({position:"fixed",top:f+"px"}))})}),this.last_destination.length>0&&a(c).on("scroll.fndtn.magellan",function(){var d=a(c).scrollTop(),e=d+a(c).height(),f=Math.ceil(b.last_destination.offset().top);a("[data-magellan-destination]").each(function(){var c=a(this),g=c.attr("data-magellan-destination"),h=c.offset().top-d;h<=b.settings.threshold&&a("[data-magellan-arrival='"+g+"']").trigger("arrival"),e>=a(b.scope).height()&&f>d&&e>f&&a("[data-magellan-arrival]").last().trigger("arrival")})}),this.settings.init=!0},set_threshold:function(){this.settings.threshold||(this.settings.threshold=this.fixed_magellan.length>0?this.outerHeight(this.fixed_magellan,!0):0)},off:function(){a(this.scope).off(".fndtn.magellan")},reflow:function(){}}}(b.zj,this,this.document)});
