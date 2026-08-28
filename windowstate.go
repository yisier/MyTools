package main

import (
	"encoding/json"
	"os"
	"path/filepath"
	"sync"
	"time"

	"github.com/adrg/xdg"
	"github.com/wailsapp/wails/v3/pkg/application"
	"github.com/wailsapp/wails/v3/pkg/events"
)

const (
	minWindowWidth      = 960
	minWindowHeight     = 640
	defaultWindowWidth  = 1200
	defaultWindowHeight = 800
)

type windowState struct {
	Width     int  `json:"width"`
	Height    int  `json:"height"`
	X         int  `json:"x"`
	Y         int  `json:"y"`
	Maximised bool `json:"maximised"`
}

func stateFile() string {
	return filepath.Join(xdg.ConfigHome, "mytools", "window-state.json")
}

func loadWindowState() *windowState {
	data, err := os.ReadFile(stateFile())
	if err != nil {
		return nil
	}

	var st windowState
	if err := json.Unmarshal(data, &st); err != nil {
		return nil
	}
	if st.Width < minWindowWidth || st.Height < minWindowHeight {
		return nil
	}
	return &st
}

func saveWindowState(st *windowState) {
	dir := filepath.Dir(stateFile())
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return
	}
	data, err := json.Marshal(st)
	if err != nil {
		return
	}
	_ = os.WriteFile(stateFile(), data, 0o644)
}

func captureWindowState(win *application.WebviewWindow) *windowState {
	st := &windowState{Maximised: win.IsMaximised()}
	if st.Maximised {
		st.Width = defaultWindowWidth
		st.Height = defaultWindowHeight
	} else {
		st.Width, st.Height = win.Size()
		st.X, st.Y = win.Position()
	}
	return st
}

func trackWindowState(win *application.WebviewWindow) {
	var (
		mu    sync.Mutex
		timer *time.Timer
	)

	debouncedSave := func() {
		mu.Lock()
		defer mu.Unlock()
		if timer != nil {
			timer.Stop()
		}
		timer = time.AfterFunc(500*time.Millisecond, func() {
			saveWindowState(captureWindowState(win))
		})
	}

	save := func() {
		mu.Lock()
		if timer != nil {
			timer.Stop()
		}
		mu.Unlock()
		saveWindowState(captureWindowState(win))
	}

	win.OnWindowEvent(events.Common.WindowClosing, func(*application.WindowEvent) { save() })
	win.OnWindowEvent(events.Common.WindowMaximise, func(*application.WindowEvent) { save() })
	win.OnWindowEvent(events.Common.WindowUnMaximise, func(*application.WindowEvent) { save() })
	win.OnWindowEvent(events.Common.WindowDidMove, func(*application.WindowEvent) { debouncedSave() })
	win.OnWindowEvent(events.Common.WindowDidResize, func(*application.WindowEvent) { debouncedSave() })
}