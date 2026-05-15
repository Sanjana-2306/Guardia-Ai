@REM ----------------------------------------------------------------------------
@REM Maven Start Up Batch script
@REM
@REM Required ENV vars:
@REM   JAVA_HOME - location of a JDK home dir
@REM ----------------------------------------------------------------------------

@IF "%__MVNW_ARG0_NAME__%"=="" (SET __MVNW_ARG0_NAME__=%~nx0)
@SET DP0=%~dp0
@SET MAVEN_PROJECTBASEDIR=%DP0%
@SET MVNW_VERBOSE=false

@IF NOT "%MVNW_VERBOSE%"=="true" @ECHO OFF

@REM ==== START VALIDATION ====
IF NOT "%JAVA_HOME%"=="" GOTO OkJHome

FOR /f "tokens=*" %%i IN ('where java') DO SET JAVA_HOME=%%~dpi..
IF "%JAVA_HOME%"=="" (
  ECHO Error: JAVA_HOME not found in your environment. >&2
  EXIT /B 1
)

:OkJHome

SET MAVEN_OPTS=%MAVEN_OPTS% -Xss10m

SET WRAPPER_JAR="%DP0%.mvn\wrapper\maven-wrapper.jar"
SET WRAPPER_LAUNCHER=org.apache.maven.wrapper.MavenWrapperMain
SET DOWNLOAD_URL="https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.6/apache-maven-3.9.6-bin.zip"

FOR /F "usebackq tokens=1,2 delims==" %%A IN ("%DP0%.mvn\wrapper\maven-wrapper.properties") DO (
    IF "%%A"=="distributionUrl" SET DOWNLOAD_URL=%%B
)

"%JAVA_HOME%\bin\java" -cp %WRAPPER_JAR% %WRAPPER_LAUNCHER% %MAVEN_CONFIG% %*
IF ERRORLEVEL 1 GOTO error
GOTO end

:error
SET ERROR_CODE=1

:end
@ENDLOCAL & SET ERROR_CODE=%ERROR_CODE%

IF NOT "%MVNW_VERBOSE%"=="true" @ECHO OFF
EXIT /B %ERROR_CODE%
