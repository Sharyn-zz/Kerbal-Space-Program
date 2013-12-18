function getUrlImageCatalog(page, imageSize) {
    return catalogFirstImageUrl.replace("_1.jpg", "_" + page + imageSize + ".jpg")
}
var currentPageImage = catalogCurrentPage;
var inSearchMode = false;
var currentSearch = "";
var totalBlocPagination = Math.ceil(catalogTotalPage / PaginationBlocCount);
$(document).ready(function() {
    $.ajax({url: urlRequestButton, dataType: "html", type: "POST", success: function(data) {
            $(".stand-actions").html(data)
        }});
    var pageBookEffectNb = 0;
    if (10 <= catalogTotalPage && 50 > catalogTotalPage) {
        pageBookEffectNb = 7
    } else {
        if (50 <= catalogTotalPage && 500 > catalogTotalPage) {
            pageBookEffectNb = 15
        } else {
            if (500 <= catalogTotalPage) {
                pageBookEffectNb = 21
            }
        }
    }
    function moveScrollBar() {
        var newListPosition = 0 - (totalListCourse * ($("#pagination-scrollbar-cursor").css("top").replace("px", "") / totalCursorCourse));
        $("#pagination-content").css("top", newListPosition);
        checkPreloadContent()
    }
    function replaceScrollBarCursor() {
        var newCursorPosition = (0 - totalCursorCourse) * ($("#pagination-content").css("top").replace("px", "") / totalListCourse);
        $("#pagination-scrollbar-cursor").css("top", newCursorPosition)
    }
    function movePagination(direction) {
        var originalListPosition = parseInt($("#pagination-content").css("top").replace("px", ""));
        var newListPosition = originalListPosition;
        if ("up" == direction) {
            newListPosition = newListPosition + paginationSpeed
        } else {
            if ("down" == direction) {
                newListPosition = newListPosition - paginationSpeed
            } else {
                console.error("Erreur : function movePagination(direction) : Cett direction est inconnue.")
            }
        }
        if (newListPosition > 0) {
            newListPosition = 0
        }
        if (newListPosition < (0 - totalListCourse)) {
            newListPosition = 0 - totalListCourse
        }
        $("#pagination-content").css("top", newListPosition);
        replaceScrollBarCursor();
        checkPreloadContent();
        return false
    }
    function resizePaginationContent() {
        $("#pagination-content").height(Math.ceil(($("#pagination-content li").length / 2)) * heightLinePagination)
    }
    function replaceMainImg() {
        $("#catalogue-preview-photo a img").imagesLoaded(function($images, $proper, $broken) {
            var marginTop = ($("#catalogue-preview-photo").actual("height") - $("#catalogue-preview-photo a img").actual("height")) / 2;
            var marginLeft = ($("#catalogue-preview-photo").actual("width") - $("#catalogue-preview-photo a img").actual("width")) / 2;
            var widthBookBkg = $("#catalogue-preview-photo a img").actual("width");
            var heightBookBkg = $("#catalogue-preview-photo a img").actual("height");
            $(".book-bkg").css({margin: marginTop + "px 0 0 " + marginLeft + "px", width: widthBookBkg, height: heightBookBkg, "padding-right": pageBookEffectNb});
            $(".icon-zoom-stand").height(heightBookBkg);
            $(".corner").css("width", pageBookEffectNb).css("height", pageBookEffectNb);
            $(".corner-page").css("right", pageBookEffectNb - 1);
            checkTextVersion()
        })
    }
    function checkTextVersion() {
        if ("" == $("#pagination-page-" + currentPageImage + " a span.pagination-catalog-preview-content").html()) {
            $("#link-text-version").hide()
        } else {
            $("#link-text-version").show()
        }
    }
    function checkPreloadContent() {
        if (PaginationBlocCount > catalogTotalPage) {
            return false
        }
        var currentDisplayZoneHeight = (-1 * parseInt($("#pagination-content").css("top").replace("px", ""))) + parseInt($("#pagination-container").actual("height"));
        var nextBlock = ((currentDisplayZoneHeight - (currentDisplayZoneHeight % blockPaginationHeight)) / blockPaginationHeight) + 2;
        if (nextBlock > maxBloc) {
            nextBlock = nextBlock - 1
        }
        if (nextBlock <= maxBloc) {
            if (0 < nextBlock && nextBlock <= totalBlocPagination) {
                initialiazeBlockPagination(nextBlock)
            }
            if (0 < (nextBlock - 1) && nextBlock <= totalBlocPagination) {
                initialiazeBlockPagination(nextBlock - 1)
            }
            if (0 < (nextBlock - 2) && nextBlock <= totalBlocPagination) {
                initialiazeBlockPagination(nextBlock - 2)
            }
        }
    }
    $("#pagination-container").css("display", "none");
    $("#pagination-scrollbar-arrow-up").attr("href", "#");
    $("#pagination-scrollbar-arrow-down").attr("href", "#");
    $("#link-text-version").attr("href", "#");
    $("#catalog-text-content").css("display", "none");
    var alreadyLoadedBloc = new Array();
    var templatePaginationBloc = '<a href="#"><img src="%%imageUrl%%" alt="' + catalogTitle + '"><p class="thumb-page">P. %%pageNumber%%</p><span class="pagination-catalog-preview-content">%%contentCatalog%%</span></a>';
    populatePagination(1, PaginationBlocCount);
    var currentTextPage = 0;
    if (1 == currentPageImage) {
        $(".catalogue-preview-page").prepend('<span id="current-catalog-page">1</span> / ')
    }
    alreadyLoadedBloc.push(1);
    var countPage = $("#pagination-content li").length;
    var heightLinePagination = parseInt($("#pagination-content li").first().outerHeight());
    var paginationSpeed = heightLinePagination * 0.5;
    resizePaginationContent();
    var totalListCourse = $("#pagination-content").actual("height") - $("#pagination-container").actual("height");
    var maxBloc = 1 + (countPage - (countPage % PaginationBlocCount)) / PaginationBlocCount;
    var totalCursorCourse = $("#pagination-scrollbar").height() - ($("#pagination-scrollbar-cursor").outerHeight(true));
    var newCursorHeight = totalCursorCourse / ($("#pagination-content").actual("height") / $("#pagination-container").actual("height"));
    if (30 < newCursorHeight) {
        $("#pagination-scrollbar-cursor").height(newCursorHeight)
    } else {
        $("#pagination-scrollbar-cursor").height(30)
    }
    var blockPaginationHeight = (PaginationBlocCount * heightLinePagination) / 2;
    totalCursorCourse = $("#pagination-scrollbar").height() - ($("#pagination-scrollbar-cursor").outerHeight(true));
    if (catalogCurrentPage > 1 && catalogCurrentPage > (countPage - 8)) {
        var topListPosition = 0
    } else {
        var topListPosition = heightLinePagination * (((catalogCurrentPage - 1) - ((catalogCurrentPage - 1) % 2)) / 2)
    }
    $("#pagination-content").css("top", -parseInt(topListPosition));
    replaceScrollBarCursor();
    $("#pagination-container").css("display", "block");
    $("#pagination-content li a img").live("click", function(e) {
        $(this).parents("li").trigger("click", e)
    });
    $("div.tooltip-pagination-content,#pagination-content li").live("click", function() {
        var newPageImage = 0;
        if (!$(this).parents(".ui-tooltip").data("currentPage")) {
            newPageImage = $(this).attr("id").replace("pagination-page-", "")
        } else {
            newPageImage = $(this).parents(".ui-tooltip,li").data("currentPage")
        }
        if (currentPageImage != newPageImage) {
            trackEvent("PDF", "ClickCarouselThumbnail", "SeeBigThumbnail");
            currentPageImage = newPageImage;
            $("#catalogue-preview-photo a span").addClass("main-image-loading");
            var templateImage = '<div class="book-bkg"><img src="%%urlImage%%" alt="%%catalogTitle%%" /><span class="corner top-right"></span><span class="corner bottom-left"></span><div class="corner-page"></div></div>';
            $("#catalogue-preview-photo ").find(".book-bkg").remove();
            if (0 !== $(this).find("img").length) {
                var newImageUrl = $(this).find("img").attr("src").replace(".jpg", "mg.jpg")
            } else {
                var newImageUrl = $(this).find("a").attr("href").replace(".jpg", "mg.jpg")
            }
            var newImage = templateImage.replace("%%urlImage%%", newImageUrl).replace("%%catalogTitle%%", catalogTitle);
            $("#catalogue-preview-photo ").find("a").append(newImage);
            $("#catalogue-preview-photo .book-bkg").css("display", "none");
            $("#catalogue-preview-photo a").imagesLoaded(function($images, $proper, $broken) {
                replaceMainImg();
                $("#catalogue-preview-photo a span").removeClass("main-image-loading");
                $("#catalogue-preview-photo .book-bkg").fadeIn()
            });
            $("#current-catalog-page").html(newPageImage);
            $("#catalogue-preview-description").fadeOut()
        }
        $(window).scrollTop(400);
        return false
    });
    function initialiazeBlockPagination(blocIndex) {
        if ("-1" != alreadyLoadedBloc.indexOf(blocIndex)) {
            return false
        }
        alreadyLoadedBloc.push(blocIndex);
        var startBlocIndex = 1 + ((blocIndex - 1) * PaginationBlocCount);
        addLoadingClass(startBlocIndex, PaginationBlocCount);
        $.ajax({type: "POST", url: ajaxCatalogPaginationUrl, dataType: "json", data: "catalogId=" + catalogId + "&offset=" + startBlocIndex + "&limit=" + PaginationBlocCount, success: function(msg) {
                if (msg != "") {
                    $.extend(JsonPaginationData, msg);
                    populatePagination(startBlocIndex, PaginationBlocCount)
                }
            }, error: function(jqXHR, textStatus, errorThrown) {
                alert("This catalog pagination can't be loaded now. Please try again later.")
            }});
        return true
    }
    function populatePagination(startIndex, limit) {
        for (i = startIndex; i < (startIndex + limit); i++) {
            var contentBlocPage = templatePaginationBloc;
            contentBlocPage = contentBlocPage.replace("%%imageUrl%%", getUrlImageCatalog(i, ""));
            contentBlocPage = contentBlocPage.replace("%%pageNumber%%", i);
            contentBlocPage = contentBlocPage.replace("%%contentCatalog%%", JsonPaginationData[i]);
            $("#pagination-page-" + i).html(contentBlocPage);
            endloadingImage(i)
        }
        $(".pagination-catalog-preview-content").css("display", "none");
        return true
    }
    function addLoadingClass(startIndex, limit) {
        for (i = startIndex; i < (startIndex + limit); i++) {
            $("#pagination-page-" + i).addClass("pagination-loading")
        }
    }
    function endloadingImage(idPage) {
        $("#pagination-page-" + idPage + " a").css("display", "none");
        $("#pagination-page-" + idPage).imagesLoaded(function($images, $proper, $broken) {
            var marginLeft = Math.floor(($("#pagination-page-" + idPage).actual("width") - $("#pagination-page-" + idPage + " a img").actual("width")) / 2);
            var marginTop = Math.floor(($("#pagination-page-" + idPage).actual("height") - $("#pagination-page-" + idPage + " a img").actual("height")) / 2);
            $("#pagination-page-" + idPage + " a img").css({margin: marginTop + "px 0 0 " + marginLeft + "px"});
            $("#pagination-page-" + idPage + " a p").css({margin: "0 0 0 " + marginLeft + "px"});
            $("#pagination-page-" + idPage).removeClass("pagination-loading");
            $("#pagination-page-" + idPage + " a").css("display", "inline")
        })
    }
    if ($("#pagination-content li").length > 8) {
        $("#pagination-scrollbar-cursor").draggable({containment: "parent", axis: "y", cursorAt: {left: 2}, cursor: "move", start: function(e) {
                $(this).css("cursor", "move")
            }, stop: function(e) {
                $(this).css("cursor", "pointer")
            }, drag: function(e, ui) {
                moveScrollBar()
            }});
        $("#pagination-container").bind("mousewheel", function(event, delta) {
            if (delta < 0) {
                movePagination("down", 0)
            } else {
                if (delta > 0) {
                    movePagination("up", 0)
                }
            }
            return false
        });
        $(".ui-tooltip").live("mousewheel", function(event, delta) {
            if (delta < 0) {
                movePagination("down", 0)
            } else {
                if (delta > 0) {
                    movePagination("up", 0)
                }
            }
            return false
        });
        $("#pagination-container").touchwipe({wipeDown: function() {
                paginationSpeed = paginationSpeed * 3;
                movePagination("down", 0);
                paginationSpeed = paginationSpeed / 3
            }, wipeUp: function() {
                paginationSpeed = paginationSpeed * 3;
                movePagination("up", 0);
                paginationSpeed = paginationSpeed / 3
            }, min_move_x: 20, min_move_y: 20, preventDefaultEvents: true});
        $("#pagination-scrollbar-arrow-up").bind("mouseenter", function(e) {
            startPaginationMove("up", 0);
            return false
        });
        $("#pagination-scrollbar-arrow-up").bind("mouseleave", function(e) {
            stopPaginationMove();
            return false
        });
        $("#pagination-scrollbar-arrow-up").bind("click", function(e) {
            return false
        });
        $("#pagination-scrollbar-arrow-down").bind("mouseenter", function(e) {
            startPaginationMove("down", 0);
            return false
        });
        $("#pagination-scrollbar-arrow-down").bind("mouseleave", function(e) {
            stopPaginationMove();
            return false
        });
        $("#pagination-scrollbar-arrow-down").bind("click", function(e) {
            return false
        });
        var paginationMoveInterval = 0;
        function startPaginationMove(direction) {
            paginationSpeed = paginationSpeed / 10;
            paginationMoveInterval = setInterval(function() {
                if ("up" == direction) {
                    movePagination("up", 100)
                } else {
                    if ("down" == direction) {
                        movePagination("down", 100)
                    } else {
                        clearInterval(paginationMoveInterval)
                    }
                }
            }, 10)
        }
        function stopPaginationMove() {
            clearInterval(paginationMoveInterval);
            paginationSpeed = paginationSpeed * 10
        }
        if (catalogCurrentPage > (PaginationBlocCount - 8)) {
            checkPreloadContent()
        }
    } else {
        $("#pagination-scrollbar-cursor").css("display", "none");
        $("#pagination-scrollbar-arrow-up").css("display", "none");
        $("#pagination-scrollbar-arrow-down").css("display", "none")
    }
    replaceMainImg();
    $("#link-text-version").click(function() {
        var actualDisplay = $("#catalogue-preview-description").css("display");
        if ("none" == actualDisplay) {
            if (currentPageImage != currentTextPage) {
                trackEvent("PDF", "ShowTxt", "ShowTxt");
                $("#catalogue-preview-description").html("");
                $("#catalogue-preview-description").addClass("text-version-loading");
                $("#catalogue-preview-description").fadeIn();
                $.ajax({type: "POST", url: ajaxCatalogContentPageUrl, dataType: "json", data: "catalogId=" + catalogId + "&page=" + currentPageImage, success: function(msg) {
                        if (msg != "") {
                            $("#catalogue-preview-description").html(msg)
                        } else {
                            $("#catalogue-preview-description").css("display", "none")
                        }
                        currentTextPage = currentPageImage;
                        $("#catalogue-preview-description").removeClass("text-version-loading")
                    }, error: function(jqXHR, textStatus, errorThrown) {
                        alert("This catalog content can't be loaded now. Please try again later.")
                    }})
            } else {
                if ("" != $("#catalogue-preview-description").html()) {
                    $("#catalogue-preview-description").fadeIn()
                }
            }
        } else {
            $("#catalogue-preview-description").fadeOut()
        }
        return false
    });
    var qtipOptions = {overwrite: false, style: {classes: "ui-tooltip-light ui-tooltip-shadow-perso ui-tooltip-tipped-perso", tip: {width: 10, height: 8}}, content: {text: function() {
                return""
            }}, position: {my: "bottom center", viewport: $("#catalogue-preview-thumbs"), at: "top center", adjust: {method: "shift"}}, show: {delay: 500, fixed: true, ready: true}, hide: {fixed: true}, events: {render: function(e, api) {
                $(this).bind("mousewheel", function(event, delta) {
                    $(this).hide()
                })
            }, show: function(e, api) {
                var tooltipTemplate = '<div class="tooltip-pagination-content"><p><a href="%%urlImage%%"></a>%%content%%</p></div>';
                var content = $(e.originalEvent.currentTarget).parents("li").find("span").html();
                var urlImage = $(e.originalEvent.currentTarget).parents("li").find("img").attr("src");
                var tooltipContent = tooltipTemplate.replace("%%content%%", content);
                tooltipContent = tooltipContent.replace("%%urlImage%%", urlImage);
                $(this).data("currentPage", $(e.originalEvent.currentTarget).parents("li").attr("id").replace("pagination-page-", ""));
                if (null == content || "" == content) {
                    e.preventDefault()
                }
                $(this).qtip("api").set({"content.text": tooltipContent})
            }}, prerender: false};
    $("#pagination-content li a img").live("mouseenter", function(event) {
        var currentQtipOptions = qtipOptions;
        currentQtipOptions.show.event = event.type;
        $(this).qtip(currentQtipOptions, event)
    });
    $(".icon-zoom-stand").click(function(e) {
        trackEvent("PDF", "ZoomPage", "ZoomPage");
        showCatalogViewer();
        return false
    });
    var indexSearchAnchor = window.location.hash.indexOf("#search");
    if ("-1" != indexSearchAnchor) {
        inSearchMode = true;
        currentSearch = decodeURIComponent(window.location.hash.substr(indexSearchAnchor).replace("#search-", ""));
        trackEvent("PDF", "ZoomPage", "ZoomPage");
        showCatalogViewer()
    }
    var openAnchor = window.location.hash.indexOf("#open");
    if ("-1" != openAnchor) {
        trackEvent("PDF", "ZoomPage", "ZoomPage");
        showCatalogViewer()
    }
    $("ol.catalogue-preview-others li").each(function() {
        var selectorLi = $(this);
        selectorLi.find("div.detail-image-link img").imagesLoaded(function($images, $proper, $broken) {
            var newWidth = (selectorLi.actual("width")) - (selectorLi.find("div.detail-image-link img").outerWidth(true));
            selectorLi.find("div.detail-image-content a").width(newWidth)
        })
    })
});
var htmlViewerTemplate = '    <div id="catalog-overlay">\n        <div id="catalogue-details">\n            <div id="catalogue-details-action">\n                <a href="#" class="details-action home" title="' + catalogPageTranslationArray.viewerHomeLabel + '"></a>\n                <a href="#" class="details-action summary" title="' + catalogPageTranslationArray.viewerSummaryLabel + '"></a>\n                <div class="details-action-pagination" title="' + catalogPageTranslationArray.viewerPageDisrectAccessLabel + '">\n                        <input class="pagination-field" type="text" name="" value="1" />\n                        <span id="total-viewer-page"></span>\n                </div>\n                <a href="#" class="details-action print" title="' + catalogPageTranslationArray.viewerPrintLabel + '"></a>\n            </div>\n            <div class="details-action-search" title="' + catalogPageTranslationArray.viewerTooltipSearchLabel + '">\n                <input class="search-field" type="text" name="" value="' + catalogPageTranslationArray.viewerSearchLabel + '" /><input class="search-submit" type="submit" name="" value="" />\n                <img class="filter-reset" src="' + filterResetUrlImage + '" alt="reset" />\n            </div>\n            <div class="details-action-close" title="' + catalogPageTranslationArray.viewerCloseLabel + '"></div>\n            <div id="catalogue-details-zoom" class="viewer-content-zoom"></div>\n            <div id="catalogue-details-photo"></div>\n            <a class="catalogue-photo-prev" href="#"></a>\n            <a class="catalogue-photo-next" href="#"></a>\n            <div id="footer-visio">\n                <div id="footer-visio-content">\n                    <a class="catalogue-thumbs-prev" href="#"></a>\n                    <div id="thumbnail-list">\n                        <ol id="catalogue-details-thumbs"></ol>\n                    </div>\n                    <a class="catalogue-thumbs-next" href="#"></a>\n                </div>\n            </div>\n        </div>\n    </div>\n    ';
var htmlloadingViewerTemplate = '    <div id="catalog-overlay">\n        <div id="viewer-loading"></div>\n    </div>\n    ';
var catalogViewerInitiliazed = false;
var catalogViewerEnabled = false;
var dataPage = "";
var dataPageFull = "";
var tooltipSearchResultMessage = "";
function closeCatalogViewer() {
    if (true == catalogViewerInitiliazed) {
        catalogViewerEnabled = false;
        $("#catalog-overlay").hide()
    }
}
var viewerContentOnLoad = false;
var enableCaroussel = false;
var viewerCatalog;
var pageInVisio = Array;
var imagesPaginationLoaded = Array;
var oldCurrentPageImage = 0;
var searchEnable = false;
var isTouchDevice = ("ontouchstart" in window);
function showCatalogViewer() {
    if (true === isTouchDevice) {
        $(window).scrollTop(0)
    }
    catalogViewerEnabled = true;
    if (true == catalogViewerInitiliazed) {
        $("#catalog-overlay").show(0, function(e) {
            $("#catalog-overlay").trigger("onShow", currentPageImage)
        })
    } else {
        if (false == viewerContentOnLoad) {
            $("body").append(htmlloadingViewerTemplate);
            var catalogOverlayCss = {height: $(document).height(), width: $(document).width()};
            if (true === isTouchDevice) {
                catalogOverlayCss.top = parseInt($(window).height() * 0.05)
            }
            $("#catalog-overlay").css(catalogOverlayCss);
            $("#viewer-loading").css("top", (($(window).height() - 268) / 2) + $(window).scrollTop());
            viewerContentOnLoad = true;
            $.ajax({type: "POST", url: ajaxViewerContentUrl, timeout: 30000, dataType: "json", data: "catalogId=" + catalogId, success: function(jsonData) {
                    dataPage = jsonData;
                    dataPageFull = jsonData;
                    catalogViewerInitiliazed = true;
                    oldCurrentPageImage = currentPageImage;
                    if (true == inSearchMode && 0 != dataPage.length) {
                        $.ajax({type: "POST", url: ajaxViewerSearchContentUrl, timeout: 30000, dataType: "json", data: "catalogId=" + catalogId + "&search=" + currentSearch, success: function(jsonData) {
                                if (Object.keys(jsonData).length != 0) {
                                    dataPage = jsonData
                                } else {
                                    inSearchMode = false
                                }
                                $("#catalog-overlay").remove();
                                currentPageImage = dataPage[1];
                                initViewer()
                            }, error: function(jqXHR, textStatus, errorThrown) {
                                $("#catalog-overlay").remove();
                                catalogViewerEnabled = false;
                                viewerContentOnLoad = false;
                                alert("This catalog can't be loaded in viewer now. Please try again later.")
                            }})
                    } else {
                        $("#catalog-overlay").remove();
                        initViewer()
                    }
                    if (true === isTouchDevice) {
                        $("#catalogue-details").css({position: "absolute", top: parseInt($(window).height() * 0.05), left: "5%"})
                    }
                }, error: function(jqXHR, textStatus, errorThrown) {
                    $("#catalog-overlay").remove();
                    catalogViewerEnabled = false;
                    viewerContentOnLoad = false;
                    alert("This catalog can't be loaded in viewer now. Please try again later.")
                }})
        }
    }
}
function initViewer() {
    $("body").append(htmlViewerTemplate);
    function activateZoom(idDisplayPage) {
        $("#catalogue-details-zoom").addClass("zoom");
        $("#catalogue-details-photo div.pagevisio-" + idDisplayPage).addClass("zoom");
        var marginTop = $("#catalogue-details-photo div.pagevisio-" + idDisplayPage + " img").first().css("margin-top");
        var marginLeft = $("#catalogue-details-photo div.pagevisio-" + idDisplayPage + " img").first().css("margin-left");
        var imgMargin = marginTop + "px 0 0 " + marginLeft + "px";
        $("#catalogue-details-photo div.pagevisio-" + idDisplayPage).gzoom({sW: $("#catalogue-details-photo").width(), sH: $("#catalogue-details-photo").height(), iW: $("#catalogue-details-photo div.pagevisio-" + idDisplayPage + " img").first().actual("width"), iH: $("#catalogue-details-photo div.pagevisio-" + idDisplayPage + " img").actual("height"), margin: imgMargin, bottomMargin: 130, movediv: "catalogue-details-zoom", gaTrackEnable: true, gaTrackCategory: "PDF", gaTrackAction: "ZoomImage", gaTrackLabel: "ZoomZoom", unZoomMethodCallback: resizeViewer, currentPageInViewer: currentPage})
    }
    function resetZoom(idDisplayPage) {
        $("#catalogue-details-zoom").removeClass("hand").removeClass("zoom");
        $("#catalogue-details-photo div.pagevisio-" + idDisplayPage).removeClass("hand").removeClass("zoom");
        $("#catalogue-details-zoom").unbind("mousemove");
        $("#catalogue-details-zoom").unbind("touchmove");
        $("#catalogue-details-zoom").unbind("click");
        $("#catalogue-details-photo div.pagevisio-" + idDisplayPage).unbind("click")
    }
    function moveImg(idNewPage) {
        flagNoSpam = "enable";
        if (idNewPage == 1) {
            $(".catalogue-photo-prev").hide()
        } else {
            $(".catalogue-photo-prev").show()
        }
        if (idNewPage >= totalVisioPage) {
            $(".catalogue-photo-next").hide()
        } else {
            $(".catalogue-photo-next").show()
        }
        resetZoom(currentPage);
        resetZoom(idNewPage);
        updateIndexPage(idNewPage);
        idPage = parseInt(idNewPage);
        if (currentPage == 0) {
            currentPage = idPage
        }
        loadedMove(idPage);
        var previousIdPage = parseInt(idPage) - 1;
        var nextIdPage = parseInt(idPage) + 1;
        var divContentSelector = $("#catalogue-details-photo div.pagevisio-" + idPage);
        if (0 == divContentSelector.html().length) {
            for (i in dataPage[currentPage]) {
                if ("indexOf" != i) {
                    $("#catalogue-details-photo div.pagevisio-" + currentPage).append('<img src="' + getUrlImageCatalog(dataPage[currentPage][i], "b") + '" alt="' + catalogTitle + '" />')
                }
            }
        }
        if (0 != previousIdPage && 0 == $("#catalogue-details-photo div.pagevisio-" + previousIdPage).html().length) {
            for (i in dataPage[previousIdPage]) {
                if ("indexOf" != i) {
                    $("#catalogue-details-photo div.pagevisio-" + previousIdPage).append('<img src="' + getUrlImageCatalog(dataPage[previousIdPage][i], "b") + '" alt="' + catalogTitle + '" />')
                }
            }
        }
        if (totalVisioPage >= nextIdPage && 0 == $("#catalogue-details-photo div.pagevisio-" + nextIdPage).html().length) {
            for (i in dataPage[nextIdPage]) {
                if ("indexOf" != i) {
                    $("#catalogue-details-photo div.pagevisio-" + nextIdPage).append('<img src="' + getUrlImageCatalog(dataPage[nextIdPage][i], "b") + '" alt="' + catalogTitle + '" />')
                }
            }
        }
        var divImgContentSelector = $("#catalogue-details-photo div.pagevisio-" + idPage + " img");
        divImgContentSelector.first().css("visibility", "none");
        divContentSelector.first().addClass("loading");
        divContentSelector.children().hide();
        divContentSelector.imagesLoaded(function($images, $proper, $broken) {
            var totalContentWidth = 0;
            var totalContentHeight = 0;
            divImgContentSelector.first().css("margin", "0 0 0 0");
            divImgContentSelector.each(function() {
                totalContentWidth = totalContentWidth + $(this).actual("width");
                if (totalContentHeight < $(this).actual("height")) {
                    totalContentHeight = $(this).actual("height")
                }
            });
            var newHeigth = ($("#catalogue-details-photo").actual("height") - totalContentHeight) / 2;
            if (0 > newHeigth) {
                newHeigth = 0
            }
            divImgContentSelector.first().css("visibility", "visible");
            if (0 != divImgContentSelector.next().length) {
                divImgContentSelector.next().css("visibility", "visible")
            }
            divContentSelector.first().removeClass("loading");
            divContentSelector.children().show();
            responsiveViewer(idPage)
        })
    }
    function loadedMove(idNewPage) {
        idNewPage = parseInt(idNewPage);
        if (currentPage < idNewPage) {
            $("#catalogue-details-photo div.pagevisio-" + idNewPage).css("left", -$("#catalogue-details-photo").actual("width"));
            $("#catalogue-details-photo div.pagevisio-" + idNewPage).css("display", "block");
            var fn = function() {
                $("#catalogue-details-photo div.pagevisio-" + currentPage).animate({left: 0}, 0).animate({left: -$("#catalogue-details-photo").actual("width"), avoidTransforms: false}, vitesseSlide, function() {
                    $(this).css("display", "none");
                    flagNoSpam = "none"
                })
            };
            $("#catalogue-details-photo div.pagevisio-" + idNewPage).animate({left: $("#catalogue-details-photo").actual("width")}, 0).css("display", "block").animate({left: 0, avoidTransforms: false}, vitesseSlide, null);
            if (currentPage != 0) {
                fn()
            }
        } else {
            if (currentPage > idNewPage) {
                $("#catalogue-details-photo div.pagevisio-" + idNewPage).css("left", $("#catalogue-details-photo").actual("width"));
                $("#catalogue-details-photo div.pagevisio-" + idNewPage).css("display", "block");
                var fn2 = function() {
                    $("#catalogue-details-photo div.pagevisio-" + currentPage).animate({left: 0}, 0).animate({left: $("#catalogue-details-photo").actual("width"), avoidTransforms: false}, vitesseSlide, function() {
                        $(this).css("display", "none");
                        flagNoSpam = "none"
                    })
                };
                $("#catalogue-details-photo div.pagevisio-" + idNewPage).animate({left: -$("#catalogue-details-photo").actual("width")}, 0).css("display", "block").animate({left: 0, avoidTransforms: false}, vitesseSlide, null);
                fn2()
            }
        }
        focusOnPage(idNewPage);
        currentPage = idNewPage
    }
    function focusOnPage(visioPageId) {
        preloadViewerPagination(visioPageId);
        $("li a.pagevisio-" + currentPage).removeClass("actif");
        $("li a.pagevisio-" + visioPageId).addClass("actif");
        var pagePosition = $("li a.pagevisio-" + visioPageId).parent().position();
        var paginationContenerWidth = $("#thumbnail-list").actual("width");
        var paginationListWidth = $("ol#catalogue-details-thumbs").actual("width");
        var newPaginationPosition = (-pagePosition.left) + ((paginationContenerWidth / 2) - 40);
        if (0 < parseInt(newPaginationPosition) || enableCaroussel == false) {
            newPaginationPosition = 0
        } else {
            if ((paginationListWidth + newPaginationPosition) < paginationContenerWidth) {
                newPaginationPosition = paginationContenerWidth - paginationListWidth
            }
        }
        if (true == enableCaroussel) {
            $("ol#catalogue-details-thumbs").css({left: newPaginationPosition})
        }
    }
    function updateIndexPage(currentIndexPage) {
        var catalogueIdPage = 0;
        for (i in dataPage[currentIndexPage]) {
            if (0 == catalogueIdPage && "indexOf" != i) {
                catalogueIdPage = parseInt(dataPage[currentIndexPage][i])
            }
        }
        $(".pagination-field").attr("value", catalogueIdPage)
    }
    function responsiveViewer(idDisplayPage) {
        $("#catalog-overlay").css({height: $(document).height(), width: $(document).width()});
        resetZoom(idDisplayPage);
        if (true === isTouchDevice) {
            resizeViewerForZoom()
        }
        resizeViewer(idDisplayPage);
        var enableZoom = false;
        var imgHeightTmp = 0;
        var imgWidthTmp = 0;
        $("#catalogue-details-photo div.pagevisio-" + idDisplayPage + " img").each(function() {
            imgWidthTmp = $(this).actual("width");
            imgHeightTmp = $(this).actual("height");
            $(this).width("auto");
            $(this).height("auto");
            if ($("#catalogue-details-photo").actual("width") < $(this).actual("width") || $("#catalogue-details-photo").actual("height") < $(this).actual("height")) {
                enableZoom = true
            }
            $(this).width(imgWidthTmp);
            $(this).height(imgHeightTmp)
        });
        if (false === isTouchDevice && true === enableZoom) {
            $("#catalogue-details-zoom").addClass("zoom");
            $("#catalogue-details-photo div.pagevisio-" + idDisplayPage).addClass("zoom");
            $("#catalogue-details-zoom").unbind("click");
            $("#catalogue-details-zoom").click(function(e) {
                e.preventDefault();
                $("#catalogue-details-zoom").unbind("click");
                resizeViewerForZoom();
                resizeViewer(currentPage);
                if (false === isTouchDevice) {
                    replaceViewer()
                }
                resizeCarousel(currentPage);
                focusOnPage(currentPage);
                activateZoom(currentPage);
                $("#catalogue-details-zoom").trigger("click", {pageX: e.pageX, pageY: e.pageY});
                return false
            })
        }
        if (false === isTouchDevice) {
            replaceViewer()
        }
        resizeCarousel(idDisplayPage);
        focusOnPage(idDisplayPage);
        if (idDisplayPage == 1) {
            $(".catalogue-photo-prev").hide()
        } else {
            $(".catalogue-photo-prev").show()
        }
        if (idDisplayPage >= totalVisioPage) {
            $(".catalogue-photo-next").hide()
        } else {
            $(".catalogue-photo-next").show()
        }
    }
    function replaceViewer() {
        var viewerWidth = $("#catalogue-details").actual("width");
        var viewerHeight = parseInt($("#catalogue-details").actual("height"));
        var windowHeight = $(window).height();
        var windowWidth = $(window).width();
        var top = (windowHeight - viewerHeight) / 2;
        var left = (windowWidth - viewerWidth) / 2;
        if (30 < top) {
            top = top - 30
        }
        $("#catalogue-details").css({left: (left + $(window).scrollLeft()), top: (top + $(window).scrollTop())})
    }
    function checkCarousselComands() {
        if ($("#catalogue-details-thumbs").actual("width") < $("#thumbnail-list").actual("width")) {
            $("a.catalogue-thumbs-next").hide();
            $("a.catalogue-thumbs-prev").hide()
        } else {
            $("a.catalogue-thumbs-next").show();
            $("a.catalogue-thumbs-prev").show();
            var carousselPosition = $("#catalogue-details-thumbs").css("left").replace("px", "");
            if (10 > Math.abs(carousselPosition)) {
                $("a.catalogue-thumbs-prev").hide()
            }
            if ((Math.abs(carousselPosition) + $("#thumbnail-list").actual("width")) >= ($("#catalogue-details-thumbs").actual("width") - 10)) {
                $("a.catalogue-thumbs-next").hide()
            }
        }
    }
    function resizeCarousel(idDisplayPage) {
        var withContener = $("#catalogue-details-photo div.pagevisio-" + idDisplayPage).actual("width");
        var leftPosition = 45;
        var newWitdhCarrousel = withContener - (leftPosition * 2);
        $("#thumbnail-list").width(newWitdhCarrousel);
        $("#thumbnail-list").css("left", leftPosition);
        paginationSlideLength = Math.ceil($("#thumbnail-list").actual("width") * 0.7);
        if ($("#catalogue-details-thumbs").actual("width") > $("#thumbnail-list").actual("width") && enableCaroussel == false) {
            enableCaroussel = true;
            $("a.catalogue-thumbs-next").click(function() {
                preloadViewerPagination(detectCurrentCenterPageInCaroussel());
                var paginationPosition = $("ol#catalogue-details-thumbs").position();
                var newPaginationPosition = paginationPosition.left - paginationSlideLength;
                var paginationListWidth = $("ol#catalogue-details-thumbs").actual("width");
                var paginationContenerWidth = $("#thumbnail-list").actual("innerWidth");
                if (0 >= newPaginationPosition && (paginationListWidth + paginationPosition.left) > paginationContenerWidth) {
                    if ((paginationListWidth + newPaginationPosition) < paginationContenerWidth) {
                        newPaginationPosition = paginationContenerWidth - paginationListWidth
                    }
                    var ecart = (newPaginationPosition - paginationPosition.left) / 15;
                    var i = 1;
                    var movePaginationThumb = setInterval(function() {
                        $("ol#catalogue-details-thumbs").css({left: paginationPosition.left + (ecart * i)});
                        i = i + 1;
                        if (i == 15) {
                            clearInterval(movePaginationThumb)
                        }
                        checkCarousselComands()
                    }, 50)
                }
                preloadViewerPagination(detectCurrentCenterPageInCaroussel());
                return false
            });
            $("a.catalogue-thumbs-prev").click(function() {
                preloadViewerPagination(detectCurrentCenterPageInCaroussel());
                var paginationPosition = $("ol#catalogue-details-thumbs").position();
                var newPaginationPosition = paginationPosition.left + paginationSlideLength;
                if (paginationSlideLength > newPaginationPosition) {
                    if (0 < newPaginationPosition) {
                        newPaginationPosition = 0
                    }
                    var ecart = (newPaginationPosition - paginationPosition.left) / 15;
                    var i = 1;
                    var movePaginationThumb = setInterval(function() {
                        $("ol#catalogue-details-thumbs").css({left: paginationPosition.left + (ecart * i)});
                        i = i + 1;
                        if (i == 15) {
                            clearInterval(movePaginationThumb)
                        }
                        checkCarousselComands()
                    }, 50)
                }
                preloadViewerPagination(detectCurrentCenterPageInCaroussel());
                return false
            });
            $("#footer-visio-content").bind("mousewheel", function(event, delta) {
                event.preventDefault();
                if (delta < 0) {
                    $("a.catalogue-thumbs-prev").trigger("click")
                } else {
                    if (delta > 0) {
                        $("a.catalogue-thumbs-next").trigger("click")
                    }
                }
                return false
            });
            if (true === isTouchDevice) {
                $("#catalogue-details-zoom").on("swipeleft", function(e) {
                    $("a.catalogue-photo-next:visible").trigger("click");
                    return false
                }).on("swiperight", function(e) {
                    $("a.catalogue-photo-prev:visible").trigger("click");
                    return false
                })
            }
            $("#footer-visio-content").touchwipe({wipeLeft: function() {
                    $("a.catalogue-thumbs-next").trigger("click")
                }, wipeRight: function() {
                    $("a.catalogue-thumbs-prev").trigger("click")
                }, min_move_x: 20, min_move_y: 20, preventDefaultEvents: true})
        } else {
            if ($("#catalogue-details-thumbs").actual("width") <= $("#thumbnail-list").actual("width")) {
                enableCaroussel = false;
                $("#footer-visio-content").unbind("touchstart");
                $("#footer-visio-content").unbind("mousewheel");
                $("a.catalogue-thumbs-prev").unbind("click");
                $("a.catalogue-thumbs-next").unbind("click");
                $("a.catalogue-thumbs-prev").hide();
                $("a.catalogue-thumbs-next").hide();
                var positionCenterCarrousel = (($("#thumbnail-list").actual("width") - $("#catalogue-details-thumbs").actual("width")) / 2);
                $("#catalogue-details-thumbs").css("left", positionCenterCarrousel)
            }
        }
    }
    function resizeViewer(idDisplayPage) {
        var heightMax = (($(window).height() / 100) * 90) - 30;
        var widthMax = ($(window).width() / 100) * 90;
        var widthMin = 500;
        var heightMin = 500;
        var selectorViewer = $("#catalogue-details");
        var selectorPageImgList = $("#catalogue-details-photo div.pagevisio-" + idDisplayPage + " img");
        var selectorPage = $("#catalogue-details-photo div.pagevisio-" + idDisplayPage);
        $("#catalog-overlay").css({height: $(document).actual("height"), width: $(document).actual("width")});
        selectorPageImgList.each(function() {
            $(this).css({width: "auto", height: "auto", top: 0, left: 0})
        });
        var imgWidth = selectorPageImgList.first().actual("width");
        var imgheight = selectorPageImgList.first().actual("height");
        if (2 == dataPage[idDisplayPage].length) {
            imgWidth = imgWidth + selectorPageImgList.next().actual("width");
            if (imgheight < selectorPageImgList.next().actual("height")) {
                imgheight = selectorPageImgList.next().actual("height")
            }
        }
        var divwidth = selectorPage.actual("width");
        var divheight = selectorPage.actual("height");
        if (imgWidth > divwidth || imgheight > divheight) {
            if (imgWidth <= widthMax && imgheight <= heightMax) {
                divwidth = imgWidth;
                divheight = imgheight
            } else {
                if (imgWidth > widthMax && imgheight > heightMax) {
                    var ratioWidth = widthMax / imgWidth;
                    var ratioHeight = heightMax / imgheight;
                    if (ratioWidth >= ratioHeight) {
                        divheight = heightMax;
                        divwidth = (imgWidth * (divheight / imgheight))
                    } else {
                        divwidth = widthMax;
                        divheight = imgheight * (divwidth / imgWidth)
                    }
                } else {
                    if (imgWidth > widthMax) {
                        divheight = imgheight * (widthMax / imgWidth);
                        divwidth = widthMax
                    } else {
                        if (imgheight > heightMax) {
                            divwidth = (imgWidth * (heightMax / imgheight));
                            divheight = heightMax
                        }
                    }
                }
            }
        }
        if (selectorViewer.actual("width") < widthMin) {
            widthMin = Math.ceil(widthMin);
            if (0 != (widthMin % 2)) {
                widthMin = widthMin + 1
            }
            selectorViewer.width(widthMin);
            selectorPage.width(widthMin)
        } else {
            if (selectorViewer.actual("width") < divwidth) {
                divwidth = Math.ceil(divwidth);
                if (0 != (divwidth % 2)) {
                    divwidth = divwidth + 1
                }
                selectorViewer.width(divwidth);
                selectorPage.width(divwidth)
            } else {
                if (selectorViewer.actual("width") > widthMax) {
                    widthMax = Math.ceil(widthMax);
                    if (0 != (widthMax % 2)) {
                        widthMax = widthMax + 1
                    }
                    selectorViewer.width(widthMax);
                    selectorPage.width(widthMax)
                }
            }
        }
        if (selectorViewer.actual("height") < heightMin) {
            heightMin = Math.ceil(heightMin);
            if (0 != (heightMin % 2)) {
                heightMin = heightMin + 1
            }
            selectorViewer.height(heightMin);
            selectorPage.height(heightMin)
        } else {
            if (selectorViewer.actual("height") < divheight) {
                divheight = Math.ceil(divheight);
                if (0 != (divheight % 2)) {
                    divheight = divheight + 1
                }
                selectorViewer.height(divheight);
                selectorPage.height(divheight)
            } else {
                if (selectorViewer.actual("height") > heightMax) {
                    heightMax = Math.ceil(heightMax);
                    if (0 != (heightMax % 2)) {
                        heightMax = heightMax + 1
                    }
                    selectorViewer.height(heightMax);
                    selectorPage.height(heightMax)
                }
            }
        }
        var ratioW = imgWidth / selectorPage.actual("width");
        var ratioH = imgheight / selectorPage.actual("height");
        var imageNewWidth = 0;
        var imageNewHeight = 0;
        if (ratioW > ratioH) {
            if (2 == dataPage[idDisplayPage].length) {
                imageNewWidth = selectorPage.actual("width") / 2
            } else {
                imageNewWidth = selectorPage.actual("width")
            }
            imageNewHeight = "auto"
        } else {
            if (ratioW < ratioH) {
                imageNewHeight = selectorPage.actual("height");
                if (2 == dataPage[idDisplayPage].length) {
                    var newRatio = imgheight / imageNewHeight;
                    imageNewWidth = Math.ceil((imgWidth / newRatio) / 2)
                } else {
                    imageNewWidth = "auto"
                }
            } else {
                if (2 == dataPage[idDisplayPage].length) {
                    imageNewWidth = selectorPage.actual("width") / 2
                } else {
                    imageNewWidth = selectorPage.actual("width")
                }
                imageNewHeight = selectorPage.actual("height")
            }
        }
        selectorPageImgList.first().width(imageNewWidth);
        selectorPageImgList.first().height(imageNewHeight);
        if (selectorViewer.actual("width") < imageNewWidth) {
            imageNewWidth = imageNewWidth - 1
        }
        selectorPageImgList.next().width(imageNewWidth);
        selectorPageImgList.next().height(imageNewHeight);
        replaceImgViewer(idDisplayPage);
        var zoomZoneHeight = selectorViewer.actual("height") - 172;
        var zoomZoneWidth = selectorViewer.actual("width") - 200;
        selectorPage.css({height: selectorViewer.actual("height"), width: selectorViewer.actual("width")});
        $(".viewer-content-zoom").css({width: zoomZoneWidth, height: zoomZoneHeight, left: 100, top: 80});
        var heightLinkPrevNext = selectorViewer.actual("height") - 122;
        $("a.catalogue-photo-prev").height(heightLinkPrevNext);
        $("a.catalogue-photo-next").height(heightLinkPrevNext);
        return false
    }
    function replaceImgViewer(idDisplayPage) {
        idDisplayPage = idDisplayPage || currentPage;
        var selectorViewer = $("#catalogue-details");
        var selectorPageImgList = $("#catalogue-details-photo div.pagevisio-" + idDisplayPage + " img");
        if (2 == dataPage[idDisplayPage].length) {
            if ((selectorPageImgList.first().actual("width") + selectorPageImgList.next().actual("width")) <= selectorViewer.actual("width") && selectorPageImgList.first().actual("height") <= selectorViewer.actual("height")) {
                var imgMarginLeft = 0;
                var imgMarginTop = 0;
                if (selectorPageImgList.first().actual("width") < selectorViewer.actual("width")) {
                    imgMarginLeft = (selectorViewer.actual("width") - selectorPageImgList.first().actual("width") - selectorPageImgList.next().actual("width")) / 2
                }
                if (selectorPageImgList.first().actual("height") < selectorViewer.actual("height")) {
                    imgMarginTop = (selectorViewer.actual("height") - selectorPageImgList.first().actual("height")) / 2
                }
                selectorPageImgList.first().css({margin: imgMarginTop + "px 0px 0px " + imgMarginLeft + "px"})
            }
        } else {
            if (selectorPageImgList.first().actual("width") <= selectorViewer.actual("width") && selectorPageImgList.first().actual("height") <= selectorViewer.actual("height")) {
                var imgMarginLeft = 0;
                var imgMarginTop = 0;
                if (selectorPageImgList.first().actual("width") < selectorViewer.actual("width")) {
                    imgMarginLeft = (selectorViewer.actual("width") - selectorPageImgList.first().actual("width")) / 2
                }
                if (selectorPageImgList.first().actual("height") < selectorViewer.actual("height")) {
                    imgMarginTop = (selectorViewer.actual("height") - selectorPageImgList.first().actual("height")) / 2
                }
                selectorPageImgList.first().css({margin: imgMarginTop + "px 0px 0px " + imgMarginLeft + "px"})
            }
        }
    }
    function resizeViewerForZoom() {
        var heightMax = (($(window).height() / 100) * 90) - 30;
        var widthMax = ($(window).width() / 100) * 90;
        var selectorViewer = $("#catalogue-details");
        var selectorPageImgList = $("#catalogue-details-photo div.pagevisio-" + currentPage + " img");
        var selectorPage = $("#catalogue-details-photo div.pagevisio-" + currentPage);
        selectorPageImgList.css({width: "auto", height: "auto", top: 0, left: 0});
        var imgWidth = selectorPageImgList.first().actual("width");
        var imgheight = selectorPageImgList.first().actual("height");
        var divwidth = selectorPage.actual("width");
        var divheight = selectorPage.actual("height");
        if (imgWidth > divwidth) {
            if (imgWidth > widthMax) {
                selectorViewer.width(widthMax);
                selectorPage.width(widthMax)
            } else {
                selectorViewer.width(imgWidth);
                selectorPage.width(imgWidth)
            }
        }
        if (imgheight > divheight) {
            if (imgheight > heightMax) {
                selectorViewer.height(heightMax);
                selectorPage.height(heightMax)
            } else {
                selectorViewer.height(imgheight);
                selectorPage.height(imgheight)
            }
        }
        return false
    }
    function preloadViewerPagination(currentPage) {
        var pageToPreload = 20;
        if (200 < totalPage) {
            pageToPreload = Math.ceil((totalPage / 20))
        }
        var startPreload = parseInt(currentPage) - pageToPreload;
        var endPreload = parseInt(currentPage) + pageToPreload;
        if (startPreload < 1) {
            startPreload = 1
        }
        if (endPreload > totalVisioPage) {
            endPreload = totalVisioPage
        }
        for (var i = startPreload; i <= endPreload; i++) {
            if ("-1" == alreadyLoadedViewerPaginationPage.indexOf(i)) {
                var pageLabel = "P. ";
                for (j in dataPage[i]) {
                    if ("indexOf" != j) {
                        var imgUrl = getUrlImageCatalog(dataPage[i][j], "");
                        var imgTemplate = '<img src="' + imgUrl + '" alt="' + catalogTitle + '" />';
                        $("a.pagevisio-" + i).append(imgTemplate);
                        if (0 == j) {
                            pageLabel = pageLabel + dataPage[i][j]
                        } else {
                            pageLabel = pageLabel + "-" + dataPage[i][j]
                        }
                    }
                }
                $("a.pagevisio-" + i).parents("li").find("p").append(pageLabel);
                alreadyLoadedViewerPaginationPage.push(i);
                $("ol#catalogue-details-thumbs li a.pagevisio-" + i).parents("li").addClass("loading");
                $("ol#catalogue-details-thumbs li a.pagevisio-" + i).imagesLoaded(function($images, $proper, $broken) {
                    var index = parseInt($(this).selector.replace("ol#catalogue-details-thumbs li a.pagevisio-", ""));
                    $("ol#catalogue-details-thumbs li a.pagevisio-" + index).parents("li").removeClass("loading");
                    var newWidth = 0;
                    var newHeight = 0;
                    $(this).find("img").each(function() {
                        newWidth = newWidth + $(this).actual("width");
                        if (newHeight < $(this).actual("height")) {
                            newHeight = $(this).actual("height")
                        }
                    });
                    $(this).width(newWidth);
                    $(this).height(newHeight);
                    var currentLiWidth = 0;
                    if (1 == dataPage[index].length) {
                        currentLiWidth = 80
                    } else {
                        currentLiWidth = 160
                    }
                    var withToReduce = currentLiWidth - newWidth;
                    $(this).parents("li").width(newWidth + 20);
                    $("ol#catalogue-details-thumbs").width($("ol#catalogue-details-thumbs").actual("width") - withToReduce);
                    if (index == endPreload) {
                        focusOnPage(currentPage)
                    }
                })
            }
        }
        checkCarousselComands()
    }
    function detectCurrentCenterPageInCaroussel() {
        var averageSizeBlocPage = $("#catalogue-details-thumbs").actual("width") / totalVisioPage;
        var actualCarousselPosition = $("#catalogue-details-thumbs").position();
        var currentCenterPage = Math.ceil((Math.abs(actualCarousselPosition.left) + Math.ceil(paginationSlideLength / 2)) / averageSizeBlocPage);
        return currentCenterPage
    }
    function closeSearchMode() {
        searchEnable = false;
        $("#catalogue-details").css("display", "none");
        $("#catalog-overlay").append('<div id="viewer-loading"></div>');
        $("#viewer-loading").css("top", (($(window).height() - 268) / 2) + $(window).scrollTop());
        inSearchMode = false;
        dataPage = dataPageFull;
        currentSearch = catalogPageTranslationArray.viewerSearchLabel;
        currentPageImage = oldCurrentPageImage;
        currentPage = oldCurrentPageImage;
        initialiazeHtmlViewer();
        $("#viewer-loading").remove();
        $("#catalogue-details").css("display", "block");
        responsiveViewer(pageInVisio[currentPageImage])
    }
    function openSearchMode(search) {
        searchEnable = false;
        $("div.details-action-search").trigger("mouseleave");
        inSearchMode = true;
        currentSearch = search;
        currentPageImage = oldCurrentPageImage;
        currentPage = oldCurrentPageImage;
        $("#catalogue-details-zoom,#footer-visio,div.catalogue-photo-prev,div.catalogue-photo-next").css("display", "none");
        $("#catalog-overlay").append('<div id="viewer-loading"></div>');
        $("#viewer-loading").css("top", (($(window).height() - 268) / 2) + $(window).scrollTop());
        trackEvent("PDF", "Search", "ZoomSearch");
        $.ajax({type: "POST", url: ajaxViewerSearchContentUrl, timeout: 30000, dataType: "json", data: "catalogId=" + catalogId + "&search=" + currentSearch, success: function(jsonData) {
                tooltipSearchResultEnable = true;
                if (Object.keys(jsonData).length == 0) {
                    $("#viewer-loading").remove();
                    $("#catalogue-details-zoom,#footer-visio,div.catalogue-photo-prev,div.catalogue-photo-next").css("display", "block");
                    closeSearchMode();
                    tooltipSearchResultMessage = catalogPageTranslationArray.viewerLabelNoSearchResult
                } else {
                    dataPage = jsonData;
                    currentPageImage = dataPage[1];
                    initialiazeHtmlViewer();
                    $("#viewer-loading").remove();
                    $("#catalogue-details-zoom,#footer-visio,div.catalogue-photo-prev,div.catalogue-photo-next").css("display", "block");
                    responsiveViewer(pageInVisio[currentPageImage]);
                    if (1 == totalPage) {
                        tooltipSearchResultMessage = catalogPageTranslationArray.viewerLabelSingleSearchResult
                    } else {
                        tooltipSearchResultMessage = catalogPageTranslationArray.viewerLabelMultiSearchResult.replace("@nombrePages@", totalPage.toString())
                    }
                }
                $("div.details-action-search").trigger("openSearchResultTooltip")
            }, error: function(jqXHR, textStatus, errorThrown) {
                closeSearchMode()
            }})
    }
    function initialiazeHtmlViewer() {
        if (true == inSearchMode) {
            $(".details-action-search .filter-reset").show()
        } else {
            $(".details-action-search .filter-reset").hide();
            currentSearch = catalogPageTranslationArray.viewerSearchLabel
        }
        $("#catalogue-details-photo").html("");
        $("#catalogue-details-thumbs").html("");
        totalVisioDualPage = 0;
        totalVisioPage = 0;
        currentPage = 0;
        totalPage = 0;
        alreadyLoadedViewerPaginationPage = new Array();
        $(".details-action-search input.search-field").attr("value", currentSearch);
        for (i in dataPage) {
            if ("indexOf" != i) {
                $("#catalogue-details-photo").append('<div class="pagevisio-' + i + '"></div>');
                nbImg = dataPage[i].length;
                loopImgCpt = 0;
                labePage = "";
                totalVisioPage = totalVisioPage + 1;
                for (j in dataPage[i]) {
                    if ("indexOf" != j) {
                        totalPage = totalPage + 1;
                        loopImgCpt = loopImgCpt + 1;
                        pageInVisio[dataPage[i][j]] = i
                    }
                }
                if (1 == nbImg) {
                    var widthLi = 100
                } else {
                    var widthLi = 180;
                    totalVisioDualPage = totalVisioDualPage + 1
                }
                $("#catalogue-details-thumbs").append('<li style="width:' + widthLi + 'px;"><a class="pagevisio-' + i + '" href="#"></a><p style="width:100%;text-align:center;"></p></li>')
            }
        }
        $("#catalogue-details-photo div").each(function() {
            $(this).css("display", "none")
        });
        var withListPagination = parseInt(100 * (totalPage - (totalVisioDualPage * 2)));
        withListPagination = withListPagination + parseInt(180 * totalVisioDualPage) + 2;
        $("ol#catalogue-details-thumbs").css("width", withListPagination);
        $(".catalogue-details-close").css("z-index", (100 + totalPage));
        $("#total-viewer-page").html(" / " + catalogTotalPage);
        $("ol#catalogue-details-thumbs li a").click(function() {
            var idpage = $(this).attr("class").toString().replace("pagevisio-", "");
            if ("-1" != idpage.indexOf("actif")) {
                return false
            }
            moveImg(idpage);
            return false
        });
        $("ol#catalogue-details-thumbs li a.pagevisio-" + pageInVisio[currentPageImage]).trigger("click");
        var divContentSelector = $("#catalogue-details-photo div.pagevisio-" + pageInVisio[currentPageImage]);
        var divImgContentSelector = $("#catalogue-details-photo div.pagevisio-" + pageInVisio[currentPageImage] + " img");
        var totalContentWidth = 0;
        var totalContentHeight = 0;
        divImgContentSelector.each(function() {
            totalContentWidth = totalContentWidth + $(this).actual("width");
            if (totalContentHeight < $(this).actual("height")) {
                totalContentHeight = $(this).actual("height")
            }
        });
        $("li a.pagevisio-" + currentPage).addClass("actif");
        divContentSelector.css("display", "block");
        responsiveViewer(pageInVisio[currentPageImage])
    }
    $("body").css("height", "auto");
    var currentPage = 0;
    var totalPage = 0;
    var totalVisioPage = 0;
    var totalVisioDualPage = 0;
    var vitesseSlide = 700;
    var homeCatalogIdPage = 1;
    var alreadyLoadedViewerPaginationPage = new Array();
    var paginationSlideLength = 480;
    var savedBaseDataPage;
    $("#catalogue-details").width(400);
    $("#catalogue-details").height(400);
    $(".catalogue-photo-prev").hide();
    $(".catalogue-photo-next").hide();
    $("#footer-visio").hide();
    var display_timeout = 0;
    var inViever = false;
    var display_footer_timeout = 0;
    var inFooterViever = false;
    var indexCut = 0;
    var url = "";
    var nbImg = 0;
    var loopImgCpt = 0;
    var labePage = "";
    initialiazeHtmlViewer();
    $("#footer-visio-content").bind("mouseenter", function() {
        inFooterViever = true;
        $("#footer-visio-content").animate({top: 0}, 400)
    });
    $("#footer-visio-content").bind("mouseleave", function() {
        inFooterViever = false;
        if (display_footer_timeout != 0) {
            clearTimeout(display_footer_timeout)
        }
        display_footer_timeout = setTimeout(function() {
            display_footer_timeout = 0;
            if (!inFooterViever) {
                $("#footer-visio-content").animate({top: 80}, 400)
            }
        }, 500)
    });
    $(".details-action-search .filter-reset").bind("click", function() {
        $(".details-action-search .search-field").attr("value", "");
        closeSearchMode()
    });
    $(".search-field").bind("focus", function() {
        searchEnable = true;
        if (false == inSearchMode) {
            $(this).attr("value", "")
        }
    });
    $(".search-submit").click(function() {
        if (true == searchEnable && "" != $(".search-field").attr("value")) {
            openSearchMode($(".search-field").attr("value"))
        }
    });
    $(".search-field").keydown(function(e) {
        if (13 == e.keyCode) {
            openSearchMode($(".search-field").attr("value"));
            return false
        }
    });
    var flagNoSpam = "none";
    $(window).keydown(function(e) {
        if (true == catalogViewerEnabled && "none" == flagNoSpam) {
            if (37 == e.keyCode) {
                if (0 < (parseInt(currentPage) - 1)) {
                    moveImg(parseInt(currentPage) - 1)
                }
                return false
            } else {
                if (39 == e.keyCode) {
                    if (totalVisioPage >= (parseInt(currentPage) + 1)) {
                        moveImg(parseInt(currentPage) + 1)
                    }
                    return false
                }
            }
        }
    });
    $("a.catalogue-photo-next").click(function() {
        moveImg(parseInt(currentPage) + 1);
        return false
    });
    $("a.catalogue-photo-prev").click(function() {
        moveImg(parseInt(currentPage) - 1);
        return false
    });
    $(".pagination-field").keydown(function(e) {
        if (13 == e.keyCode) {
            var catalogIdPage = parseInt($(".pagination-field").attr("value"));
            if (1 > catalogIdPage || catalogTotalPage < catalogIdPage) {
                catalogIdPage = 1
            }
            if (true == inSearchMode) {
                oldCurrentPageImage = catalogIdPage;
                closeSearchMode()
            } else {
                var newVisioPage = parseInt(pageInVisio[catalogIdPage]);
                moveImg(newVisioPage)
            }
            e.preventDefault();
            return false
        }
    });
    $("a.print").click(function() {
        trackEvent("PDF", "Print", "ZoomPrint");
        var html = "<HTML>\n<HEAD>\n\n</HEAD>\n<BODY>\n" + $("#catalogue-details-photo div.pagevisio-" + currentPage).html() + "\n</BODY>\n</HTML>";
        var printWP = window.open(location.href);
        printWP.document.open();
        printWP.document.write(html);
        printWP.document.close();
        printWP.print();
        if ($.browser.msie && parseInt($.browser.version, 10) === 9) {
            printWP.onfocus = function() {
                printWP.close()
            }
        } else {
            if (window.opera == 1 || navigator.userAgent.indexOf("Opera") != -1) {
                printWP.onfocus = function() {
                    printWP.close()
                }
            } else {
                printWP.close()
            }
        }
    });
    var tooltipSearchResultEnable = false;
    $("#catalogue-details-action a,#catalogue-details-action div,div.details-action-search,div.details-action-close").qtip({style: {classes: "ui-tooltip-light ui-tooltip-bootstrap ui-tooltip-shadow-perso ui-tooltip-tipped-perso"}, position: {viewport: $("#catalogue-details"), my: "top center", at: "top center", adjust: {method: "shift", y: 30}}, show: {event: "mouseover openSearchResultTooltip"}, hide: {event: "mouseleave closeSearchResultTooltip"}, events: {show: function(e, api) {
                var tooltipText;
                if ("openSearchResultTooltip" == e.originalEvent.type || (true == tooltipSearchResultEnable && "details-action-search" == e.originalEvent.currentTarget.className)) {
                    tooltipText = tooltipSearchResultMessage;
                    window.setTimeout(function() {
                        tooltipSearchResultEnable = false;
                        $("div.details-action-search").trigger("closeSearchResultTooltip")
                    }, 2500)
                } else {
                    tooltipText = $(e.originalEvent.currentTarget).attr("title")
                }
                $(this).qtip("api").set({"content.text": tooltipText})
            }, hide: function(e, api) {
                if (true == tooltipSearchResultEnable && "closeSearchResultTooltip" != e.originalEvent.type && "details-action-search" == e.originalEvent.currentTarget.className) {
                    e.preventDefault()
                }
            }}});
    $(".home").click(function(e) {
        if (true == inSearchMode) {
            closeSearchMode()
        }
        moveImg(homeCatalogIdPage);
        return false
    });
    if ("0" != catalogIndex) {
        $(".summary").click(function(e) {
            moveImg(pageInVisio[catalogIndex]);
            return false
        })
    } else {
        $(".summary").remove()
    }
    $(".details-action-close,#catalog-overlay").click(function() {
        closeCatalogViewer()
    });
    $("#catalogue-details").click(function() {
        return false
    });
    $(window).keydown(function(event) {
        if (event.keyCode == 27 && true == catalogViewerEnabled) {
            closeCatalogViewer()
        }
    });
    $("body").bind("dblclick", function() {
        return false
    });
    $(window).resize(function() {
        if (true == catalogViewerEnabled) {
            responsiveViewer(currentPage);
            return false
        }
    });
    if (false === isTouchDevice) {
        $(window).scroll(function() {
            if (true == catalogViewerEnabled) {
                replaceViewer();
                return false
            }
        })
    }
    $("#catalogue-details").bind("mouseover", function() {
        inViever = true;
        if (currentPage < totalVisioPage) {
            $(".catalogue-photo-next").show()
        } else {
            $(".catalogue-photo-next").hide()
        }
        if (currentPage > 1) {
            $(".catalogue-photo-prev").show()
        } else {
            $(".catalogue-photo-prev").hide()
        }
        $("#footer-visio").show()
    });
    $("#catalogue-details").bind("mouseleave", function() {
        inViever = false;
        if (display_timeout != 0) {
            clearTimeout(display_timeout)
        }
        display_timeout = setTimeout(function() {
            display_timeout = 0;
            if (!inViever) {
                $(".catalogue-photo-prev").hide();
                $(".catalogue-photo-next").hide();
                $("#footer-visio").hide()
            }
        }, 500)
    });
    $("#catalog-overlay").on("onShow", function(e, currentPage) {
        if (true == inSearchMode) {
            closeSearchMode()
        }
        moveImg(pageInVisio[currentPage])
    })
}
