var ImgViewHdlr = 
{
    $previewCanvas : document.getElementById('spr_edit_canvas'),
    previewCtx : document.getElementById('spr_edit_canvas').getContext('2d'),
    MODES :
    {
        IMG_VIEW : 0,
        ANIMATE  : 1
    },
    mode : 0,
    setSelectedImg: function(img)
    {
        var previewCtx = ImgViewHdlr.previewCtx;   //quick reference to the canvas context
        //start by clearing the screen regardless of whether there's an image
        previewCtx.clearRect(0, 0, 
                ImgViewHdlr.$previewCanvas.width, ImgViewHdlr.$previewCanvas.height);
        var canvasW = 512,
            canvasH = 512;
        if(img)
        { 
           canvasW = img.width;
           canvasH = img.height;
           ImgViewHdlr.$previewCanvas.width = canvasW;
           ImgViewHdlr.$previewCanvas.style.width = canvasW + 'px';
           ImgViewHdlr.$previewCanvas.height = canvasH;
           ImgViewHdlr.$previewCanvas.style.height = canvasH + 'px';
           previewCtx.drawImage(img, 0, 0);
        }
        else
        {
            ImgViewHdlr.$previewCanvas.width = canvasW;
            ImgViewHdlr.$previewCanvas.style.width = canvasW + 'px';
            ImgViewHdlr.$previewCanvas.height = canvasH;
            ImgViewHdlr.$previewCanvas.style.height = canvasH + 'px';
            previewCtx.strokeStyle = '#00FF00';
            previewCtx.font = 'normal 20px Bitstream Vera Sans Roman';
            previewCtx.fillStyle = '#000000';
            previewCtx.fillText("[no image selected]", 30, 30);
        }
    },
    viewSettings :
    {
        scale : 1.0, 
        showGrid: true,
        imgLoaded : undefined
    }
};

var AnimHdlr =
{
    rtData: 
    {
            frameIndex : 0
    }, 
    anim : {},
    init : function()
    {
        AnimHdlr.anim = AnimData[AnimListHdlr.getSelectionIndex()];
        var rtData = AnimHdlr.rtData;
        rtData.frameIndex = 0;
    },
    animate : function(deltaTime)
    {
        //add the time that goes by related to how long each frame is
        var prevFrame = AnimHdlr.rtData.frameIndex;
        var frameCount = (!(AnimHdlr.indices) ? AnimHdlr.anim.imgFrames.length : AnimHdlr.anim.indices.length);
        
        AnimHdlr.rtData.frameIndex += (deltaTime / AnimHdlr.anim.frameLength);
        //cycle anim when it has run completely
        while(Math.floor(AnimHdlr.rtData.frameIndex) >= frameCount)
        {
            AnimHdlr.rtData.animComplete = true;
            AnimHdlr.rtData.frameIndex = (AnimHdlr.rtData.frameIndex - (frameCount)) + AnimHdlr.anim.cycleTo;
        }
        //to make things simple, always refresh the image
        AnimHdlr.refreshImg();
    },
    refreshImg: function()
    {
        var index = Math.floor(AnimHdlr.rtData.frameIndex);
        var src = AnimHdlr.anim.imgFrames[index].src;
        var img = new Image();
        img.src = src;
        ImgViewHdlr.setSelectedImg(img);
    },
    runLogic : function()
    {
        AnimHdlr.animate(0.02);
        if(AnimHdlr.running)
            window.requestAnimFrame(AnimHdlr.runLogic);
    },
    start : function()
    {
        AnimHdlr.init();
        AnimHdlr.running = true;
        AnimHdlr.runLogic();
    },
    stop : function()

    {
        AnimHdlr.running = false;
    }
};

/** requestAnimFrame wrapper function 
 *       created by Paul Irish        
 * source: http://www.paulirish.com/2011/requestanimationframe-for-smart-animating */
window.requestAnimFrame = (function()
{
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          window.oRequestAnimationFrame      ||
          window.msRequestAnimationFrame     ||
          function(/* function */ callback, /* DOMElement */ element)
          {
                window.setTimeout(callback, 1000 / 50);
          };
})();

ImgViewHdlr.$previewCanvas.width = 460;
ImgViewHdlr.$previewCanvas.height = 460;
ImgViewHdlr.setSelectedImg(undefined);

// Check for the various File API support.
if (window.File && window.FileReader && window.FileList && window.Blob) 
{
  // Great success! All the File APIs are supported.
} else 
{
  alert('The File APIs are not fully supported so this app will not be able to load properly. Please upgrade your browser.');
}

/**
 * Handles all events pertaining to the animation list and how it is 
 * manipulated by the user 
 */
var AnimListHdlr = 
{
    $selector: document.getElementById('anim_select'),
    getSelectionIndex: function()
    {
        return AnimListHdlr.$selector.selectedIndex;
    },
    animExists : function(animName)
    {
        var animExists = false;
        for(var i = 0; i < AnimData.length; i++)
        {
            var n = AnimData[i].animName;
            if(n == animName)
            {
                animExists = true;
                break;
            }
        }
        return animExists;
    },
    addAnim : function(animName)
    {
        if(!AnimListHdlr.animExists(animName))
        {
            AnimData.push
            ({      //AnimData object structure
                    imgFrames : [],
                    animName  : animName,
                    frameLength : 0.50
            });
            AnimListHdlr.refreshList();
            AnimListHdlr.selectAnim(AnimData.length - 1);
            
            var $frameLenSlider = document.getElementById('frame_length_slider');
            $frameLenSlider.value = 0.5;
            $frameLenSlider.onchange();
            
            var $cycleToInput = document.getElementById('cycle_to_input');
            $cycleToInput.value = 0;
            $cycleToInput.onchange();
        }
        else
        {
            alert('the name you have selected is already in use!');
        }
    },
    removeAnim : function(animName)
    {
        if(AnimListHdlr.animExists(animName))
        {
            var indexRemoved = -1;
            for(var i = 0, n; n = AnimData[i].animName; i++)
            {
                if(n == animName)
                {
                    indexRemoved = i;
                    break;
                }
            }
            AnimData.splice(indexRemoved, 1);
        }
        AnimListHdlr.refreshList();
    },
    refreshList : function()
    {
        var selectList = AnimListHdlr.$selector;
        //clear the list
        while(selectList.options[0])
        {   selectList.remove(0);   }
        
        //add all anims to list
        if(AnimData.length > 0)
        for(var i = 0; i < AnimData.length; i++)
        {
            var n = AnimData[i].animName;
            var opt = document.createElement('option');
            opt.text = n;
            selectList.add(opt);
        }
        
        //if at least 1 anim is available, one will be selected and we know to enable widgets
        if(selectList.options.length > 0)
        {
            selectList.disabled = false;
            var $imgUploader = ImgListHdlr.$uploader;
            $imgUploader.disabled = false;
            document.getElementById('delete_anim_btn').disabled = false;
            document.getElementById('generate_js_btn').disabled = false;
            document.getElementById('frame_length_slider').disabled = false;
            document.getElementById('anim_options').style.color = '#000000';
        }
        else    //if no animation lists are available, disable the necessary widgets!
        {
            selectList.disabled = true;
            var $imgUploader = ImgListHdlr.$uploader;
            $imgUploader.disabled = true;
            document.getElementById('delete_anim_btn').disabled = true;
            document.getElementById('rename_anim_btn').disabled = true;
            document.getElementById('delete_frame_btn').disabled = true;
            document.getElementById('generate_js_btn').disabled = true;
            document.getElementById('anim_title_txt').innerHTML = '[no anim selected]';
            document.getElementById('frame_length_slider').disabled = true;
            document.getElementById('anim_options').style.color = '#666666';
        }
        EditDOM.refreshImgFrames();        
    },
    
    /** selects an animation */
    selectAnim : function(index)
    {
        var selectList = AnimListHdlr.$selector;
        selectList.selectedIndex = index;   //since we can also programmatically set the anim list index
        EditDOM.refreshImgFrames();
        ImgListHdlr.selectImgIndex(-1); //unselect any image(and reset preview img)
        document.getElementById('anim_title_txt').innerHTML = AnimData[index].animName;
        var $frameLenSlider = document.getElementById('frame_length_slider');
        $frameLenSlider.value = AnimData[index].frameLength;
        $frameLenSlider.onchange();
        
        var $cycleToInput = document.getElementById('cycle_to_input');
        $cycleToInput.value = AnimData[index].cycleTo;
        $cycleToInput.onchange();
    },
    
    toggleIndexesSelection : function()
    {
        $checkBox = document.getElementById('use_index_check');
        if($checkBox.checked)
        {
            var $indicesTxt = document.getElementById('use_index_txt');
            if($indicesTxt.value == '')
            {
                $indicesTxt.value = '0';
            }
        }
    }
};

AnimListHdlr.$selector.onchange = function()
{
    AnimListHdlr.selectAnim(AnimListHdlr.getSelectionIndex());
};

/** 
 *  contains all of the functions we need related to editing the DOM like
 *  creating divs, etc 
 */
var EditDOM = 
{
    createImgFrame : function(imgIndex, imgUrl)
    {
        var thumbBox = document.createElement('div');
        thumbBox.className = 'thumb_box';
        thumbBox.setAttribute('id', 'thumb_box_' + imgIndex);
        thumbBox.setAttribute('img_index', imgIndex);
        
        var thumbFrameP = document.createElement('p');
        thumbFrameP.className = 'thumb_frame_no';
        thumbFrameP.innerHTML = imgIndex;
        var thumbImg = document.createElement('img');
        thumbImg.className='thumb_frame';
        thumbImg.src = imgUrl;
        thumbImg.setAttribute('id', 'thumb_img_' + imgIndex);
        
        thumbBox.onclick = function()
        {
            //selecting the image as a new selection
            if(this.className == 'thumb_box')
            {
                this.className = 'thumb_box thumb_box_s';
                ImgListHdlr.selectImgIndex(this.getAttribute('img_index'));
            }
          };
        
        thumbBox.appendChild(thumbImg);
        thumbBox.appendChild(thumbFrameP);
        if(imgIndex < AnimData[AnimListHdlr.getSelectionIndex()].imgFrames.length - 1)
        {
            var thumbShiftDown = document.createElement('div');
            thumbShiftDown.className = 'thumb_shift_down';
            thumbBox.appendChild(thumbShiftDown);
            thumbShiftDown.onclick = function()
           {
                ImgListHdlr.swapImgs(imgIndex, imgIndex + 1);
                EditDOM.refreshImgFrames();
                ImgListHdlr.selectImgIndex(imgIndex + 1);
             };
        }
        if(imgIndex > 0)
        {
            var thumbShiftUp = document.createElement('div');
            thumbShiftUp.className = 'thumb_shift_up';
            thumbBox.appendChild(thumbShiftUp);
            thumbShiftUp.onclick = function()
          {
                ImgListHdlr.swapImgs(imgIndex, imgIndex - 1);
                EditDOM.refreshImgFrames();
                ImgListHdlr.selectImgIndex(imgIndex - 1);
            };
        }
        document.getElementById('thumb_list').appendChild(thumbBox);
    },
    refreshImgFrames : function()
    {                
        //clear and then create the images in the Thumbnail List!
        var thumbList = document.getElementById('thumb_list');
        thumbList.innerHTML = '';
        
        var animIndex = AnimListHdlr.getSelectionIndex();
        if(AnimData[animIndex] && AnimData[animIndex].imgFrames)
        for(var i = 0; i < AnimData[animIndex].imgFrames.length; i++)
        {
            EditDOM.createImgFrame(i, AnimData[animIndex].imgFrames[i].src);
        }
        ImgListHdlr.selectImgIndex(-1);
    }
};

var ImgListHdlr = 
{
    $uploader : document.getElementById('img_uploader'), //file uploader
    evaluateIndices : function(indicesStr)
    {
        
    },
    getImgCount : function()
    {
        return AnimData[AnimListHdlr.getSelectionIndex()].imgFrames.length;
    },
    deleteSelectedFrame : function()
    {
        var selectIndex = ImgListHdlr.selectedImg;
        console.log(AnimListHdlr.getSelectionIndex());
        var imgFrames = AnimData[AnimListHdlr.getSelectionIndex()].imgFrames;
        imgFrames.splice(selectIndex, 1);
        EditDOM.refreshImgFrames();
    },
    selectedImg : -1,
    swapImgs : function(index1, index2)    //shift dir can be 'up' or 'down'
    {
        var imgFrames = AnimData[AnimListHdlr.getSelectionIndex()].imgFrames;
        var swappedImg = imgFrames[index1];
        imgFrames[index1] = imgFrames[index2];
        imgFrames[index2] = swappedImg;
    },
    selectImgIndex : function(index)
    {
        ImgListHdlr.selectedImg = index;
        if(index != -1)
        {
            var animIndex = AnimListHdlr.$selector.selectedIndex;
            var imgCount = AnimData[animIndex].imgFrames.length;
            for(var i = 0; i < imgCount; i++)
            {
                var $thumbBox = document.getElementById('thumb_box_' + i);
                if(i == index)
                    $thumbBox.className = 'thumb_box thumb_box_s';
                else
                    $thumbBox.className = 'thumb_box';        
            }
            var previewImg = new Image();
            previewImg.src = document.getElementById('thumb_img_' + index).src;
            document.getElementById('delete_frame_btn').disabled = false;
            ImgViewHdlr.setSelectedImg(previewImg);
        }
        else
        {
            document.getElementById('delete_frame_btn').disabled = true;
            ImgViewHdlr.setSelectedImg(undefined);
        }
    }
 };
   
function handleFileSelect(e)
{
    var files = e.target.files; //get ref to selected file(s)
    
    for(var i = 0, f; f = files[i]; i++)
    {
        var reader = new FileReader();
        //closure to capture the info
        reader.onload = (function(theFile)
        {
            return function(e)
            {
                var animIndex = AnimListHdlr.$selector.selectedIndex;
                if(!AnimData[animIndex])
                {
                    AnimData[animIndex] = {};
                    AnimData[animIndex].imgFrames = [];
                }
                AnimData[animIndex].imgFrames.push
                ({  //Create an ImageFrameData object!
                    xO: 0,
                    yO: 0,
                    src:e.target.result,
                    srcFName: fileName
                }); 
                var newImgIndex = AnimData[animIndex].imgFrames.length - 1;
                EditDOM.refreshImgFrames();
            };
        })(f);
        //read in the image as a data URL & call above closure
        reader.readAsDataURL(f);
    }
    
    var filePath = document.getElementById('img_uploader').value,
        fileName = filePath.replace(/^.*(\\|\/|\:)/, '');
    
    document.getElementById('img_uploader').value='';
}

var AnimData = [];

function createAnim()
{
    AnimListHdlr.addAnim(prompt("enter the name of the new animation"));
}

function init()
{
    AnimListHdlr.refreshList();
}

var generateJS = function()
{
    var w = window.open('.js code', '.js code', 'width =400, height=400, resizeable, scrollbars');
    w.document.writeln('<pre>');
    for(var i = 0; i < AnimData.length; i++)
    {
        var a = AnimData[i];
        var tabStr = '     ';
        SrcTools.writeLn(a.animName + ": ", 0, w);
        SrcTools.writeLn("{", 0, w);
        SrcTools.writeLn("frameLength: " + a.frameLength + ", ", 1, w);
        SrcTools.writeLn("cycleTo: " + a.cycleTo + ",", 1, w);
        SrcTools.writeLn("imgs:[", 1, w);
        for(var j = 0; j < a.imgFrames.length; j++)
        {   //write source src, x offsets and y offsets of the current image frame iterated on
            var frame = a.imgFrames[j];
            SrcTools.writeLn("{ " + "src: '" + frame.srcFName + 
                "', xO: " + frame.xO + ", yO: " + frame.yO +  "},", 2, w);
        }

        SrcTools.writeLn("]" + (a.indices ? ", " : " "), 2, w);
        if(a.indices)
        {
            SrcTools.write("indices: [ ", w);
            for(var j = 0; j < a.indices.length; j++)
            {
                var entry = a.indices[j];
                SrcTools.write(entry + ((j == a.indices.length - 1) ? " " : ", " ), w);
            }
            SrcTools.writeLn(']', 0, w);
        }
        SrcTools.writeLn("}", 0, w);
    }
    w.document.writeln('</pre>');
};

SrcTools = 
{
    TAB : '     ',
    writeLn: function(str, scopeLvl, w)
    {
        for(var i = 0; i < scopeLvl; i++)
            w.document.write(SrcTools.TAB);
        w.document.writeln(str);
    },
    write: function(str, w)
    {
        w.document.write(str);  
    }
};

var frameLengthChanged = function()
{
    var $frameLenSlider = document.getElementById('frame_length_slider');
    document.getElementById('frame_length_txt').innerHTML = $frameLenSlider.value + "sec";
    var a = AnimData[AnimListHdlr.getSelectionIndex()];
    a.frameLength = $frameLenSlider.value;
};

var cycleToChanged = function()
{
    var $cycleToInput = document.getElementById('cycle_to_input');
    var a = AnimData[AnimListHdlr.getSelectionIndex()];
    a.cycleTo = $cycleToInput.value;
};

init();

document.getElementById('img_uploader').addEventListener('change', handleFileSelect, false); 
document.getElementById('create_anim_btn').addEventListener('mousedown', createAnim, false);
document.getElementById('delete_anim_btn').addEventListener('mousedown', function()
{
    var $selector = AnimListHdlr.$selector;
    var removedIndex = $selector.selectedIndex;
    AnimListHdlr.removeAnim($selector.options[removedIndex].text);    
}, false);

document.getElementById('generate_js_btn').onclick = generateJS;
document.getElementById('frame_length_slider').onchange = frameLengthChanged;
document.getElementById('cycle_to_input').onchange = cycleToChanged;
document.getElementById('delete_frame_btn').onclick = ImgListHdlr.deleteSelectedFrame;
document.getElementById('use_index_check').onchange = AnimListHdlr.toggleIndexesSelection;
document.getElementById('use_index_txt').onchange = function()
{
    var $useIndicesTxt = document.getElementById('use_index_txt');
    var source = $useIndicesTxt.value;
    var sourceArr = source.split(",");               //Split the CSV's by commas
    var toReturn  = "";                              //Declare the new string we're going to create
    for (var i = 0; i < sourceArr.length; i++)       //Check all of the elements in the array
    {
        var valid = true;
        sourceArr[i] = parseInt(sourceArr[i]);
        if(isNaN(sourceArr[i]))
        {
            alert('you have not entered a valid indice array!');
            valid = false;
            break;
        }
         //If the item is not equal
        toReturn += sourceArr[i] + ((i < sourceArr.length-1) ? ", " : " ");          //add it to the return string
    }
    if(valid)
        $useIndicesTxt.value = toReturn;
    else
    {
        $useIndicesTxt.value = '0';
    }
    
    var animSelected = AnimData[AnimListHdlr.getSelectionIndex()];
    animSelected.indices = sourceArr;
};

document.getElementById("play_anim_btn").onclick = function()
{
    AnimHdlr.start();
};