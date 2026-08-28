//go:build !windows

package main

func isWindowsDark() bool {
	return false
}