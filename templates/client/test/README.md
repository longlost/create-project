# Polymer/Web Components Testing Notes:


- Arrow functions are not best practice inside tests since the 'this' context is often used to reference Mocha context.


- Elements with a dom-repeat or dom-if template require special care since their templates are handled asynchronously.

	You must pass in the done argument into the test function since it is async code.
	Also the test must be wrapped in the flush function in order to guarantee the dom has been fully stamped before running the test.


	test(‘Conditional element is present’, function(done) {
	  flush(function() {
	    const conditionalElement = myFixture.querySelector(‘conditional-element’);
	    expect(conditionalElement).to.exist;
	    done();
	  });
	});


- In order to force distribution synchronously, call ShadyDOM.flush(). This can be useful for unit tests.