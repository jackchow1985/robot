
$(document).ready(function ($) {
    /*************************************************************
    Preload
    *************************************************************/
    $(function preview() {
        "use strict";
        try {
            var myTimer = 0; clearTimeout(myTimer);
            myTimer = setTimeout(function () { $("#loader-wrapper").slideUp() }, 2000);

        } catch (err) {
        }
    });


    /*************************************************************
    Percentage skillbar
    *************************************************************/
    $(function skillbar() {
        "use strict";
        try {
            $('.skillbar').each(function () {
                $(this).find('.skillbar-bar').animate({
                    width: $(this).attr('data-percent')
                }, 6000);
            });
        } catch (err) {
        }
    });

    /*************************************************************
    Linebar
    *************************************************************/
    function lineBar() {
        "use strict";
        try {
            $('.linebar').each(function () {
                $(this).find('.linebar-bar').animate({
                    width: $(this).attr('data-percent')
                }, 4000);
            });
        } catch (err) {
        }
    };

    /*************************************************************
    Tooltip
    *************************************************************/
    $(function tooltip() {
        "use strict";
        $('[data-toggle="tooltip"]').tooltip()
    });

    /*************************************************************
    SlideShow
    *************************************************************/
    $(function () {
        "use strict";
        try {
            new BoxesFx(document.getElementById('boxgallery'));
        } catch (err) {
        }
    });

    /*************************************************************
    Filter Porfolio
    *************************************************************/
    $(function filter() {
        "use strict";
        try {
            $('.filter li').on('click', function () {
                $('li').removeClass('active');
                $(this).addClass('active');
            });
        } catch (err) {
        }
    });

    /*************************************************************
    Filter Porfolio Dresses
    *************************************************************/
    $(function filter() {
        "use strict";
        try {
            $('.filter-dresses li').on('click', function () {
                $('li').removeClass('active');
                $(this).addClass('active');
            });
        } catch (err) {
        }
    });

    /*************************************************************
    Carousel
    *************************************************************/
    $(function () {
        "use strict";
        $("#owl-demo").owlCarousel({
            navigation: false, // Show next and prev buttons
            slideSpeed: 300,
            paginationSpeed: 400,
            singleItem: true,
            autoPlay: true
            // "singleItem:true" is a shortcut for:
            // items : 1, 
            // itemsDesktop : false,
            // itemsDesktopSmall : false,
            // itemsTablet: false,
            // itemsMobile : false

        });
    });

    /*************************************************************
    Small FlexSlider With thumbs
    *************************************************************/
    $(function flexThumb() {
        "use strict";
        $('.flexthumb').flexslider({
            animation: "slide",
            controlNav: "thumbnails"

        });
    });

    /*************************************************************
    Small FlexSlider Slide
    *************************************************************/
    $(function flexImg() {
        "use strict";
        $('.flexslider').flexslider({
            animation: "slide",
            controlNav: ""

        });
    });

    /*************************************************************
    FancyBox Open Image
    *************************************************************/
    $(function fancyImg() {
        "use strict";
        try {
            $(".fancybox-effects-d").fancybox({
                padding: 0,

                openEffect: 'elastic',
                openSpeed: 150,

                closeEffect: 'elastic',
                closeSpeed: 150,

                closeClick: true,

                helpers: {
                    css: {
                        'background': 'rgba(238,238,238,0.85)'
                    },
                    overlay: {
                        locked: false
                    }
                }
            });
        } catch (err) {
        }
    });


    /**
    * Copyright (c) 2007-2012 Ariel Flesler - aflesler(at)gmail(dot)com | http://flesler.blogspot.com
    * Dual licensed under MIT and GPL.
    * @author Ariel Flesler
    * @version 1.4.3
    */
    ; (function ($) { var h = $.scrollTo = function (a, b, c) { $(window).scrollTo(a, b, c) }; h.defaults = { axis: 'xy', duration: parseFloat($.fn.jquery) >= 1.3 ? 0 : 1, limit: true }; h.window = function (a) { return $(window)._scrollable() }; $.fn._scrollable = function () { return this.map(function () { var a = this, isWin = !a.nodeName || $.inArray(a.nodeName.toLowerCase(), ['iframe', '#document', 'html', 'body']) != -1; if (!isWin) return a; var b = (a.contentWindow || a).document || a.ownerDocument || a; return /webkit/i.test(navigator.userAgent) || b.compatMode == 'BackCompat' ? b.body : b.documentElement }) }; $.fn.scrollTo = function (e, f, g) { if (typeof f == 'object') { g = f; f = 0 } if (typeof g == 'function') g = { onAfter: g }; if (e == 'max') e = 9e9; g = $.extend({}, h.defaults, g); f = f || g.duration; g.queue = g.queue && g.axis.length > 1; if (g.queue) f /= 2; g.offset = both(g.offset); g.over = both(g.over); return this._scrollable().each(function () { if (!e) return; var d = this, $elem = $(d), targ = e, toff, attr = {}, win = $elem.is('html,body'); switch (typeof targ) { case 'number': case 'string': if (/^([+-]=)?\d+(\.\d+)?(px|%)?$/.test(targ)) { targ = both(targ); break } targ = $(targ, this); if (!targ.length) return; case 'object': if (targ.is || targ.style) toff = (targ = $(targ)).offset() } $.each(g.axis.split(''), function (i, a) { var b = a == 'x' ? 'Left' : 'Top', pos = b.toLowerCase(), key = 'scroll' + b, old = d[key], max = h.max(d, a); if (toff) { attr[key] = toff[pos] + (win ? 0 : old - $elem.offset()[pos]); if (g.margin) { attr[key] -= parseInt(targ.css('margin' + b), 10) || 0; attr[key] -= parseInt(targ.css('border' + b + 'Width'), 10) || 0 } attr[key] += g.offset[pos] || 0; if (g.over[pos]) attr[key] += targ[a == 'x' ? 'width' : 'height']() * g.over[pos] } else { var c = targ[pos]; attr[key] = c.slice && c.slice(-1) == '%' ? parseFloat(c) / 100 * max : c } if (g.limit && /^\d+$/.test(attr[key])) attr[key] = attr[key] <= 0 ? 0 : Math.min(attr[key], max); if (!i && g.queue) { if (old != attr[key]) animate(g.onAfterFirst); delete attr[key] } }); animate(g.onAfter); function animate(a) { $elem.animate(attr, f, g.easing, a && function () { a.call(this, e, g) }) } }).end() }; h.max = function (a, b) { var c = b == 'x' ? 'Width' : 'Height', scroll = 'scroll' + c; if (!$(a).is('html,body')) return a[scroll] - $(a)[c.toLowerCase()](); var d = 'client' + c, html = a.ownerDocument.documentElement, body = a.ownerDocument.body; return Math.max(html[scroll], body[scroll]) - Math.min(html[d], body[d]) }; function both(a) { return typeof a == 'object' ? a : { top: a, left: a} } })(jQuery);


    $(document).on("scroll", onScroll);

    function onScroll(event) {
        try {
            var scrollPos = $(window).scrollTop();

            //Page Index
            if ($('#about4ourteam').length > 0) {
                if (scrollPos > $('#about4ourteam').offset().top) {
                    lineBar();
                }
            }

            //Page index
            if ($('#cbp-vm').length > 0) {
                if (scrollPos > $('#cbp-vm').offset().top) {
                    $('.img-trasp').addClass('fadeInLeftPhone');

                    var myTimerPhone = 0; clearTimeout(myTimerPhone);

                    myTimerPhone = setTimeout(function () { $('.iphone-desc ul li:nth-child(1)').addClass('fadeInDown') }, 600);
                    myTimerPhone = setTimeout(function () { $('.iphone-desc ul li:nth-child(2)').addClass('fadeInDown') }, 900);
                    myTimerPhone = setTimeout(function () { $('.iphone-desc ul li:nth-child(3)').addClass('fadeInDown') }, 1200);
                    myTimerPhone = setTimeout(function () { $('.iphone-desc ul li:nth-child(4)').addClass('fadeInDown') }, 1500);
                    myTimerPhone = setTimeout(function () { $('.iphone-desc ul li:nth-child(5)').addClass('fadeInDown') }, 1800);
                }
            }

            if ($('#home2Pass').length > 0) {
                if (scrollPos > $('#home2Pass').offset().top) {
                    var myTimerPhone = 0; clearTimeout(myTimerPhone);

                    myTimerPhone = setTimeout(function () { $('.iphone-desc ul li:nth-child(1)').addClass('fadeInDown') }, 600);
                    myTimerPhone = setTimeout(function () { $('.iphone-desc ul li:nth-child(2)').addClass('fadeInDown') }, 900);
                    myTimerPhone = setTimeout(function () { $('.iphone-desc ul li:nth-child(3)').addClass('fadeInDown') }, 1200);
                    myTimerPhone = setTimeout(function () { $('.iphone-desc ul li:nth-child(4)').addClass('fadeInDown') }, 1500);
                    myTimerPhone = setTimeout(function () { $('.iphone-desc ul li:nth-child(5)').addClass('fadeInDown') }, 1800);
                }
            }

            //Page about4
            if ($('#html5service').length > 0) {
                if (scrollPos > $('#html5service').offset().top) {
                    $('.effect-diagonal').addClass('effectopacity');
                }
            }


        } catch (err) {
            //            console.log('error',err);
        }
    }

});
/*************************************************************
    Porfolio
*************************************************************/
$(window).load(function () {
   try {
    var $container = $('.albumContainer');
    $container.isotope({
        filter: '*',
        animationOptions: {
            duration: 750,
            easing: 'linear',
            queue: false
        }
    });

    $('.albumFilter li').on('click', function () {
        var selector = $(this).attr('data-filter');
        $container.isotope({
            filter: selector,
            animationOptions: {
                duration: 750,
                easing: 'linear',
                queue: false
            }
        });
        return false;
    });
    } catch (err) {
    }
});





