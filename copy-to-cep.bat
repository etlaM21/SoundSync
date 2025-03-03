@echo off
xcopy /E /I /Y dist "%CommonProgramFiles(x86)%\Adobe\CEP\extensions\soundsync"
echo Extension copied successfully into CEP folder!