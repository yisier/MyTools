package main

import (
	"embed"
	"log"

	"github.com/wailsapp/wails/v3/pkg/application"
)

//go:embed all:dist
var assets embed.FS

func main() {
	bg := application.NewRGB(255, 255, 255)
	if isWindowsDark() {
		bg = application.NewRGB(0x14, 0x14, 0x14)
	}

	var app *application.App

	app = application.New(application.Options{
		Name:        "MyTools",
		Description: "开发者工具箱",
		Assets: application.AssetOptions{
			Handler: application.AssetFileServerFS(assets),
		},
		SingleInstance: &application.SingleInstanceOptions{
			UniqueID: "com.yisier.mytools",
			OnSecondInstanceLaunch: func(data application.SecondInstanceData) {
				if win, ok := app.Window.GetByName("main"); ok {
					win.UnMinimise()
					win.Show()
					win.Focus()
				}
			},
		},
		Mac: application.MacOptions{
			ApplicationShouldTerminateAfterLastWindowClosed: true,
		},
	})

	winOpts := application.WebviewWindowOptions{
		Name:             "main",
		Title:            "MyTools",
		MinWidth:         minWindowWidth,
		MinHeight:        minWindowHeight,
		BackgroundColour: bg,
		URL:              "/",
	}
	// 恢复上次关闭时的窗口状态（最大化/尺寸/位置）
	if st := loadWindowState(); st != nil {
		winOpts.Width = st.Width
		winOpts.Height = st.Height
		winOpts.X = st.X
		winOpts.Y = st.Y
		winOpts.InitialPosition = application.WindowXY
		if st.Maximised {
			winOpts.StartState = application.WindowStateMaximised
		}
	} else {
		winOpts.Width = defaultWindowWidth
		winOpts.Height = defaultWindowHeight
		winOpts.InitialPosition = application.WindowCentered
	}

	win := app.Window.NewWithOptions(winOpts)
	trackWindowState(win)

	err := app.Run()
	if err != nil {
		log.Fatal(err)
	}
}
