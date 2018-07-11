import * as del from 'del';
import * as log from 'fancy-log';
import * as gulp from 'gulp';
import * as gulpExec from 'gulp-exec';
import * as md2html from 'gulp-markdown';
import * as rename from 'gulp-rename';
import * as replace from 'gulp-replace';
import gulpTslint from 'gulp-tslint';
import * as gulpTs from 'gulp-typescript';
import * as gulpRunSequence from 'run-sequence';
import * as tslint from 'tslint';

import * as prettierPlugin_ from 'gulp-prettier-plugin';

const prettierPlugin: any = prettierPlugin_;

function pipeErrHandler(err: any) {
  log(err);
  process.exit(1);
}

const PRETTIER_SRC = ['src/**/*.*', 'typings/**/*.*', 'test/**/*.*'];
const PRETTIER_IGNORE = [
  '!**/package.json',
  '!**/dist/**/*.*',
  '!**/src/views/**/*.*',
  '!**/src/public/**/*.*',
  '!**/node_modules/**/*.*',
  '!**/temp/**/*.*',
  '!**/*.yaml',
  '!**/*.yml',
  '!**/*.sh',
  '!**/*.html',
  '!**/*.lock',
  '!**/*.ejs',
  '!**/*.*-',
  '!**/*.sql',
  '!**/*.txt',
];

const PRETTIER_CONFIG = {
  trailingComma: 'all',
  useTabs: false,
  singleQuote: true,
  tabWidth: 2,
  semi: true,
  printWidth: 80,
};

// copy assets files from src to dist
gulp.task('copy-assets', () => {
  return gulp
    .src([
      'package.json',
      'package-lock.json',
      'yarn.lock',
      'src/**/*',
      '!src/**/*.ts',
      '!src/public/node_modules/**/*',
      '!src/public/payment.html',
    ])
    .pipe(gulp.dest('dist/src/'));
});

gulp.task('clean-build', () => {
  return del.sync(['dist/**/*', 'dist/**/.*']);
});

gulp.task('replace', () => {
  gulp
    .src(['./dist/src/routes/swagger.js'])
    .pipe(replace('localhost', '192.168.1.247'))
    .pipe(gulp.dest('./dist/src/routes'));

  gulp
    .src(['./dist/src/public/docs/index.html'])
    .pipe(replace('localhost', '192.168.1.247'))
    .pipe(gulp.dest('./dist/src/public/docs'));

  gulp
    .src(['./dist/src/public/index.html'])
    .pipe(replace('--this-will-be-set-in-builds--', new Date() + ''))
    .pipe(gulp.dest('./dist/src/public'));

  // change app name package.json file in dist folder
  gulp
    .src(['./dist/src/public/package.json'])
    .pipe(replace('public-development', 'public-production'))
    .pipe(gulp.dest('./dist/src/public'));

  gulp
    .src(['./dist/src/package.json'])
    .pipe(replace('aumet-admin-app-development', 'aumet-admin-app-production'))
    .pipe(gulp.dest('./dist/src'));
});

gulp.task('clean-schema-doc', () => {
  return del.sync([
    'src/assets/schema-doc.html',
    'schema-doc-generator/schema-doc.md',
    'schema-doc-generator/dist/*',
    'schema-doc-generator/schema-dist/*',
  ]);
});

// task `clean-schema-doc` need to run before this task
gulp.task('generate-schema-docs', () => {
  return gulp
    .src('./schema-doc-generator/schema-dist/*.js')
    .pipe(
      gulpExec(
        'node schema-doc-generator/dist/schema-doc.bin.js <%= file.path %>',
      ),
    )
    .pipe(gulpExec.reporter());
});

gulp.task('compile-schema-doc-generator', () => {
  const docGenProj = gulpTs.createProject('schema-doc-generator/tsconfig.json');
  return docGenProj
    .src()
    .pipe(docGenProj())
    .on('error', pipeErrHandler)
    .pipe(gulp.dest(docGenProj.options.outDir));
});

gulp.task('compile-schema', () => {
  const schemaCompileProj = gulpTs.createProject(
    'schema-doc-generator/ts-schema-config.json',
  );
  return schemaCompileProj
    .src()
    .pipe(schemaCompileProj())
    .on('error', pipeErrHandler)
    .pipe(gulp.dest(schemaCompileProj.options.outDir));
});

gulp.task('schema-docMD-to-html', () => {
  return gulp
    .src('schema-doc-generator/schema-doc.md')
    .pipe(md2html())
    .on('error', pipeErrHandler)
    .pipe(rename('schema-doc.html'))
    .on('error', pipeErrHandler)
    .pipe(gulp.dest('src/root'));
});

gulp.task('schema-doc-html-fine-tune', () => {
  // replace &lt;br&gt; with <br>
  return gulp
    .src(['src/root/schema-doc.html'])
    .pipe(replace('&lt;br&gt;', '<br>'))
    .pipe(replace('    ', '&nbsp;&nbsp;')) // for indentation
    .pipe(gulp.dest('src/root'));
});
gulp.task('build-schema-doc', cb => {
  gulpRunSequence(
    'clean-schema-doc',
    ['compile-schema-doc-generator', 'compile-schema'],
    'generate-schema-docs',
    'schema-docMD-to-html',
    'schema-doc-html-fine-tune',
    cb,
  );
});

// build process

gulp.task('prettier-noFix', () =>
  gulp
    .src([...PRETTIER_SRC, ...PRETTIER_IGNORE])
    .pipe(prettierPlugin(PRETTIER_CONFIG, { filter: true, validate: true }))
    .on('error', pipeErrHandler),
);

gulp.task('tslint-noFix', () => {
  const lintProgram = tslint.Linter.createProgram('./tsconfig.json');
  /**
   * this pipe is exit code ready
   */
  return gulp
    .src(['src/**/*.ts', ...PRETTIER_IGNORE])
    .pipe(
      gulpTslint({
        program: lintProgram,
      }),
    )
    .pipe(gulpTslint.report());
});

gulp.task('compile-code', () => {
  const appCodeTsProject = gulpTs.createProject('tsconfig.json');
  return appCodeTsProject
    .src()
    .pipe(appCodeTsProject())
    .on('error', pipeErrHandler)
    .pipe(gulp.dest(appCodeTsProject.options.outDir));
});

gulp.task('lint-noFix', cb => {
  gulpRunSequence(['prettier-noFix', 'tslint-noFix'], cb);
});

gulp.task('build', cb => {
  gulpRunSequence(
    ['clean-build', 'clean-schema-doc'],
    ['compile-schema-doc-generator', 'compile-schema', 'prettier-noFix'],
    ['generate-schema-docs', 'tslint-noFix', 'compile-code'],
    'schema-docMD-to-html',
    'schema-doc-html-fine-tune',
    'copy-assets',
    'replace',
    cb,
  );
});
