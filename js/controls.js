import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

export function setupControls(covers,
    frontCover,
    rearCover,
    leftUpper,
    leftLower,
    rightUpper,
    rightLower,
    topCover,
    bottomCover
)
{
    window.hideAllCovers = () =>
    {
        covers.visible = false;
    };

    window.showAllCovers = () =>
    {
        covers.visible = true;
    };
    
    window.toggleCover = (name) =>
    {
        switch(name)
        {
            case "front":
                frontCover.visible =
                    !frontCover.visible;
                break;
    
            case "rear":
                rearCover.visible =
                    !rearCover.visible;
                break;
    
            case "leftUpper":
                leftUpper.visible =
                    !leftUpper.visible;
                break;
    
            case "leftLower":
                leftLower.visible =
                    !leftLower.visible;
                break;
    
            case "rightUpper":
                rightUpper.visible =
                    !rightUpper.visible;
                break;
    
            case "rightLower":
                rightLower.visible =
                    !rightLower.visible;
                break;
    
            case "top":
                topCover.visible =
                    !topCover.visible;
                break;
    
            case "bottom":
                bottomCover.visible =
                    !bottomCover.visible;
                break;
        }
    };
    
}

export function setupViewControls(camera, currentLookAt)
{
    window.setTopView = function()
    {
        camera.position.set(0, 150, 0);
        camera.lookAt(0, 0, 0);
        currentLookAt.set(0, 0, 0);
    };
    
    window.setFrontView = function()
    {
        camera.position.set(0, 5, 25);
        camera.lookAt(0, 0, 0);
        currentLookAt.set(0, 0, 0);
    };
    
    window.setSideView = function()
    {
        camera.position.set(25, 5, 0);
        camera.lookAt(0, 0, 0);
        currentLookAt.set(0, 0, 0);
    };
    
    window.setRearView = function()
    {
        camera.position.set(0, 5, -25);
        camera.lookAt(0, 0, 0);
        currentLookAt.set(0, 0, 0);
    };
}